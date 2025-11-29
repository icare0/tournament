/**
 * State Machine pour la gestion des états d'un Match
 *
 * États possibles:
 * - PENDING: Match créé mais pas encore prêt à démarrer
 * - READY: Participants confirmés, en attente du démarrage
 * - ONGOING: Match en cours
 * - DISPUTE: Litige en cours (résultat contesté)
 * - COMPLETED: Match terminé avec résultat validé
 * - CANCELLED: Match annulé
 *
 * Transitions autorisées:
 * PENDING → READY → ONGOING → COMPLETED
 *              ↓        ↓
 *          CANCELLED  DISPUTE → COMPLETED
 */

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { MatchStatus } from '@prisma/client';

// Extension des états Prisma pour notre State Machine
export enum MatchState {
  PENDING = 'SCHEDULED',    // Mapping vers MatchStatus.SCHEDULED
  READY = 'SCHEDULED',      // Sous-état de SCHEDULED (via metadata)
  ONGOING = 'LIVE',         // Mapping vers MatchStatus.LIVE
  DISPUTE = 'DISPUTED',     // Mapping vers MatchStatus.DISPUTED
  COMPLETED = 'COMPLETED',  // Mapping vers MatchStatus.COMPLETED
  CANCELLED = 'CANCELLED',  // Mapping vers MatchStatus.CANCELLED
}

export interface MatchStateMetadata {
  subState?: 'pending' | 'ready'; // Pour différencier PENDING et READY
  disputeReason?: string;
  transitionHistory?: Array<{
    from: MatchState;
    to: MatchState;
    timestamp: Date;
    triggeredBy: string; // userId ou 'system'
    reason?: string;
  }>;
}

export interface StateTransitionResult {
  success: boolean;
  newState: MatchState;
  message: string;
  metadata?: MatchStateMetadata;
}

@Injectable()
export class MatchStateMachine {
  private readonly logger = new Logger(MatchStateMachine.name);

  // Définition des transitions autorisées
  private readonly allowedTransitions: Map<MatchState, MatchState[]> = new Map([
    [MatchState.PENDING, [MatchState.READY, MatchState.CANCELLED]],
    [MatchState.READY, [MatchState.ONGOING, MatchState.CANCELLED]],
    [MatchState.ONGOING, [MatchState.COMPLETED, MatchState.DISPUTE, MatchState.CANCELLED]],
    [MatchState.DISPUTE, [MatchState.COMPLETED, MatchState.CANCELLED]],
    [MatchState.COMPLETED, []], // État terminal (sauf reopen par admin)
    [MatchState.CANCELLED, []], // État terminal
  ]);

  constructor(private prisma: PrismaService) {}

  /**
   * Tente une transition d'état
   */
  async transition(
    matchId: string,
    toState: MatchState,
    triggeredBy: string,
    reason?: string,
  ): Promise<StateTransitionResult> {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeParticipant: true,
        awayParticipant: true,
      },
    });

    if (!match) {
      throw new BadRequestException(`Match ${matchId} not found`);
    }

    // Récupérer l'état actuel
    const currentState = this.getCurrentState(match.status, match.metadata as any);

    // Vérifier si la transition est autorisée
    if (!this.isTransitionAllowed(currentState, toState)) {
      const message = `Transition from ${currentState} to ${toState} is not allowed`;
      this.logger.warn(message);
      return {
        success: false,
        newState: currentState,
        message,
      };
    }

    // Vérifier les pré-conditions de la transition
    const validation = await this.validateTransition(match, currentState, toState);
    if (!validation.valid) {
      return {
        success: false,
        newState: currentState,
        message: validation.reason!,
      };
    }

    // Effectuer la transition
    const metadata = this.buildNewMetadata(
      match.metadata as any,
      currentState,
      toState,
      triggeredBy,
      reason,
    );

    const newStatus = this.mapStateToStatus(toState);

    await this.prisma.match.update({
      where: { id: matchId },
      data: {
        status: newStatus,
        metadata,
        // Mettre à jour les timestamps selon l'état
        ...(toState === MatchState.ONGOING && { startedAt: new Date() }),
        ...(toState === MatchState.COMPLETED && { completedAt: new Date() }),
      },
    });

    // Déclencher des side-effects selon la transition
    await this.handleSideEffects(matchId, currentState, toState);

    this.logger.log(
      `Match ${matchId} transitioned from ${currentState} to ${toState} by ${triggeredBy}`,
    );

    return {
      success: true,
      newState: toState,
      message: `Match state changed to ${toState}`,
      metadata,
    };
  }

  /**
   * Récupère l'état actuel d'un match
   */
  private getCurrentState(
    status: MatchStatus,
    metadata?: MatchStateMetadata,
  ): MatchState {
    if (status === 'SCHEDULED') {
      // Différencier PENDING et READY via metadata
      return metadata?.subState === 'ready'
        ? MatchState.READY
        : MatchState.PENDING;
    }

    // Mapping direct pour les autres états
    const statusToState: Record<string, MatchState> = {
      LIVE: MatchState.ONGOING,
      DISPUTED: MatchState.DISPUTE,
      COMPLETED: MatchState.COMPLETED,
      CANCELLED: MatchState.CANCELLED,
    };

    return statusToState[status] || MatchState.PENDING;
  }

  /**
   * Vérifie si une transition est autorisée
   */
  private isTransitionAllowed(from: MatchState, to: MatchState): boolean {
    const allowedStates = this.allowedTransitions.get(from) || [];
    return allowedStates.includes(to);
  }

  /**
   * Valide les pré-conditions d'une transition
   */
  private async validateTransition(
    match: any,
    from: MatchState,
    to: MatchState,
  ): Promise<{ valid: boolean; reason?: string }> {
    switch (to) {
      case MatchState.READY:
        // Pour passer à READY, les deux participants doivent être confirmés
        if (!match.homeParticipantId || !match.awayParticipantId) {
          return {
            valid: false,
            reason: 'Both participants must be assigned before match can be ready',
          };
        }
        break;

      case MatchState.ONGOING:
        // Pour démarrer, le match doit être à l'heure prévue (tolérance de 30min)
        if (match.scheduledAt) {
          const now = new Date();
          const scheduled = new Date(match.scheduledAt);
          const diffMinutes = (now.getTime() - scheduled.getTime()) / 60000;

          if (diffMinutes < -30) {
            return {
              valid: false,
              reason: 'Cannot start match more than 30 minutes before scheduled time',
            };
          }
        }
        break;

      case MatchState.COMPLETED:
        // Pour terminer, un gagnant doit être défini (sauf si draw autorisé)
        if (!match.winnerId && match.homeScore === match.awayScore) {
          return {
            valid: false,
            reason: 'Match cannot be completed without a winner or draw allowed',
          };
        }
        break;

      case MatchState.DISPUTE:
        // On peut toujours contester, pas de validation spécifique
        break;

      case MatchState.CANCELLED:
        // On peut annuler sauf si déjà terminé
        if (from === MatchState.COMPLETED) {
          return {
            valid: false,
            reason: 'Cannot cancel a completed match',
          };
        }
        break;
    }

    return { valid: true };
  }

  /**
   * Construit les nouvelles métadonnées avec historique
   */
  private buildNewMetadata(
    currentMetadata: MatchStateMetadata | null,
    from: MatchState,
    to: MatchState,
    triggeredBy: string,
    reason?: string,
  ): MatchStateMetadata {
    const metadata: MatchStateMetadata = currentMetadata || {};

    // Mettre à jour le subState si nécessaire
    if (to === MatchState.PENDING) {
      metadata.subState = 'pending';
    } else if (to === MatchState.READY) {
      metadata.subState = 'ready';
    } else {
      delete metadata.subState;
    }

    // Si c'est une dispute, enregistrer la raison
    if (to === MatchState.DISPUTE && reason) {
      metadata.disputeReason = reason;
    }

    // Ajouter à l'historique
    if (!metadata.transitionHistory) {
      metadata.transitionHistory = [];
    }

    metadata.transitionHistory.push({
      from,
      to,
      timestamp: new Date(),
      triggeredBy,
      reason,
    });

    return metadata;
  }

  /**
   * Mappe un état de la state machine vers un MatchStatus Prisma
   */
  private mapStateToStatus(state: MatchState): MatchStatus {
    const stateToStatus: Record<MatchState, MatchStatus> = {
      [MatchState.PENDING]: 'SCHEDULED',
      [MatchState.READY]: 'SCHEDULED',
      [MatchState.ONGOING]: 'LIVE',
      [MatchState.DISPUTE]: 'DISPUTED',
      [MatchState.COMPLETED]: 'COMPLETED',
      [MatchState.CANCELLED]: 'CANCELLED',
    };

    return stateToStatus[state];
  }

  /**
   * Gère les side-effects d'une transition
   */
  private async handleSideEffects(
    matchId: string,
    from: MatchState,
    to: MatchState,
  ): Promise<void> {
    // TODO: Intégrer avec les autres services

    switch (to) {
      case MatchState.ONGOING:
        // Déclencher le monitoring du timeout
        this.logger.debug(`Starting timeout monitoring for match ${matchId}`);
        // await this.matchMonitorService.startMonitoring(matchId);
        break;

      case MatchState.COMPLETED:
        // Notifier les participants, mettre à jour les stats
        this.logger.debug(`Match ${matchId} completed, triggering post-match jobs`);
        // await this.notificationService.notifyMatchCompleted(matchId);
        // await this.statsService.updateParticipantStats(matchId);
        break;

      case MatchState.DISPUTE:
        // Notifier les arbitres
        this.logger.debug(`Match ${matchId} in dispute, notifying referees`);
        // await this.refereeService.notifyDispute(matchId);
        break;

      case MatchState.CANCELLED:
        // Gérer les remboursements si nécessaire
        this.logger.debug(`Match ${matchId} cancelled`);
        break;
    }
  }

  /**
   * Helpers pour les transitions communes
   */

  async markAsReady(matchId: string, triggeredBy: string): Promise<StateTransitionResult> {
    return this.transition(matchId, MatchState.READY, triggeredBy);
  }

  async startMatch(matchId: string, triggeredBy: string): Promise<StateTransitionResult> {
    return this.transition(matchId, MatchState.ONGOING, triggeredBy);
  }

  async completeMatch(matchId: string, triggeredBy: string): Promise<StateTransitionResult> {
    return this.transition(matchId, MatchState.COMPLETED, triggeredBy);
  }

  async disputeMatch(
    matchId: string,
    triggeredBy: string,
    reason: string,
  ): Promise<StateTransitionResult> {
    return this.transition(matchId, MatchState.DISPUTE, triggeredBy, reason);
  }

  async cancelMatch(
    matchId: string,
    triggeredBy: string,
    reason?: string,
  ): Promise<StateTransitionResult> {
    return this.transition(matchId, MatchState.CANCELLED, triggeredBy, reason);
  }

  /**
   * Récupère l'état actuel d'un match
   */
  async getMatchState(matchId: string): Promise<MatchState> {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      select: { status: true, metadata: true },
    });

    if (!match) {
      throw new BadRequestException(`Match ${matchId} not found`);
    }

    return this.getCurrentState(match.status, match.metadata as any);
  }

  /**
   * Récupère l'historique des transitions d'un match
   */
  async getTransitionHistory(matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      select: { metadata: true },
    });

    const metadata = match?.metadata as MatchStateMetadata | null;
    return metadata?.transitionHistory || [];
  }
}
