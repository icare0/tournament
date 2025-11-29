/**
 * BullMQ Job Processor pour le monitoring des matchs
 *
 * Responsabilités:
 * 1. Détecter les matchs "ONGOING" qui durent trop longtemps (timeout)
 * 2. Déclencher des alertes pour les arbitres
 * 3. Auto-complétion des matchs si timeout extrême
 * 4. Monitoring de la santé des matchs
 */

import { Processor, Process, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '@/common/prisma/prisma.service';
import { MatchStateMachine, MatchState } from '../state-machines/match.state-machine';

export interface MatchMonitorJobData {
  matchId: string;
  startedAt: Date;
  expectedDuration: number; // en minutes
  warningThreshold: number; // % du temps avant alerte (ex: 120% = 1.2)
  criticalThreshold: number; // % du temps avant action critique (ex: 150% = 1.5)
}

export interface MatchTimeoutAlert {
  matchId: string;
  severity: 'warning' | 'critical';
  message: string;
  currentDuration: number; // minutes
  expectedDuration: number;
  exceedPercentage: number;
}

@Processor('match-monitor')
export class MatchMonitorProcessor {
  private readonly logger = new Logger(MatchMonitorProcessor.name);

  constructor(
    private prisma: PrismaService,
    private stateMachine: MatchStateMachine,
  ) {}

  /**
   * Job principal: Vérifier le timeout d'un match
   *
   * Ce job est ajouté à la queue quand un match passe à l'état ONGOING
   * Il s'exécute périodiquement (ex: toutes les 5 minutes) pour vérifier la durée
   */
  @Process('check-timeout')
  async handleMatchTimeout(job: Job<MatchMonitorJobData>) {
    const { matchId, startedAt, expectedDuration, warningThreshold, criticalThreshold } = job.data;

    this.logger.debug(`Checking timeout for match ${matchId}`);

    // 1. Récupérer le match actuel
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeParticipant: { include: { user: true } },
        awayParticipant: { include: { user: true } },
        tournament: true,
      },
    });

    if (!match) {
      this.logger.warn(`Match ${matchId} not found, stopping monitoring`);
      return { action: 'stopped', reason: 'Match not found' };
    }

    // 2. Vérifier si le match est toujours ONGOING
    const currentState = await this.stateMachine.getMatchState(matchId);

    if (currentState !== MatchState.ONGOING) {
      this.logger.log(`Match ${matchId} is no longer ONGOING (${currentState}), stopping monitoring`);
      return { action: 'stopped', reason: `Match state is ${currentState}` };
    }

    // 3. Calculer la durée actuelle
    const now = new Date();
    const matchStart = new Date(startedAt);
    const currentDurationMs = now.getTime() - matchStart.getTime();
    const currentDurationMinutes = currentDurationMs / (1000 * 60);

    const exceedPercentage = (currentDurationMinutes / expectedDuration) * 100;

    this.logger.debug(
      `Match ${matchId}: ${currentDurationMinutes.toFixed(1)}min / ${expectedDuration}min (${exceedPercentage.toFixed(0)}%)`,
    );

    // 4. Vérifier les seuils
    if (exceedPercentage >= criticalThreshold * 100) {
      // SEUIL CRITIQUE dépassé
      return await this.handleCriticalTimeout(match, {
        matchId,
        severity: 'critical',
        message: `Match has been ongoing for ${currentDurationMinutes.toFixed(0)} minutes (${exceedPercentage.toFixed(0)}% of expected)`,
        currentDuration: currentDurationMinutes,
        expectedDuration,
        exceedPercentage,
      });
    } else if (exceedPercentage >= warningThreshold * 100) {
      // SEUIL WARNING dépassé
      return await this.handleWarningTimeout(match, {
        matchId,
        severity: 'warning',
        message: `Match is taking longer than expected: ${currentDurationMinutes.toFixed(0)} minutes (${exceedPercentage.toFixed(0)}% of expected)`,
        currentDuration: currentDurationMinutes,
        expectedDuration,
        exceedPercentage,
      });
    }

    // 5. Tout va bien, continuer le monitoring
    return {
      action: 'continue',
      currentDuration: currentDurationMinutes,
      exceedPercentage
    };
  }

  /**
   * Gère un timeout WARNING
   */
  private async handleWarningTimeout(match: any, alert: MatchTimeoutAlert) {
    this.logger.warn(`⚠️  WARNING TIMEOUT: ${alert.message}`);

    // 1. Créer une notification pour les arbitres
    await this.createAlert({
      type: 'MATCH_TIMEOUT_WARNING',
      matchId: match.id,
      tournamentId: match.tournamentId,
      severity: 'warning',
      message: alert.message,
      metadata: {
        currentDuration: alert.currentDuration,
        expectedDuration: alert.expectedDuration,
        exceedPercentage: alert.exceedPercentage,
      },
    });

    // 2. Notifier les arbitres assignés au tournoi
    // TODO: Intégrer avec le service de notifications
    // await this.notificationService.notifyReferees(match.tournamentId, alert);

    // 3. Logger dans les métadonnées du match
    const currentMetadata = (match.metadata as any) || {};
    await this.prisma.match.update({
      where: { id: match.id },
      data: {
        metadata: {
          ...currentMetadata,
          timeoutWarnings: [
            ...(currentMetadata.timeoutWarnings || []),
            {
              timestamp: new Date(),
              duration: alert.currentDuration,
              percentage: alert.exceedPercentage,
            },
          ],
        },
      },
    });

    return { action: 'warning_sent', alert };
  }

  /**
   * Gère un timeout CRITIQUE
   */
  private async handleCriticalTimeout(match: any, alert: MatchTimeoutAlert) {
    this.logger.error(`🚨 CRITICAL TIMEOUT: ${alert.message}`);

    // 1. Créer une alerte critique
    await this.createAlert({
      type: 'MATCH_TIMEOUT_CRITICAL',
      matchId: match.id,
      tournamentId: match.tournamentId,
      severity: 'critical',
      message: alert.message,
      metadata: {
        currentDuration: alert.currentDuration,
        expectedDuration: alert.expectedDuration,
        exceedPercentage: alert.exceedPercentage,
        action: 'manual_intervention_required',
      },
    });

    // 2. Notifier les arbitres ET les admins
    // TODO: Notification prioritaire
    // await this.notificationService.notifyRefereesAndAdmins(match.tournamentId, alert);

    // 3. Option A: Mettre le match en DISPUTE (intervention manuelle requise)
    await this.stateMachine.disputeMatch(
      match.id,
      'system',
      `Automatic dispute due to critical timeout: ${alert.currentDuration.toFixed(0)} minutes (expected: ${alert.expectedDuration} minutes)`,
    );

    // Option B (alternative): Auto-compléter avec le score actuel
    // if (match.homeScore !== match.awayScore) {
    //   await this.stateMachine.completeMatch(match.id, 'system-auto-complete');
    // }

    return { action: 'dispute_created', alert };
  }

  /**
   * Crée une alerte dans la base de données
   */
  private async createAlert(alertData: {
    type: string;
    matchId: string;
    tournamentId: string;
    severity: string;
    message: string;
    metadata: any;
  }) {
    // Utiliser le modèle Job pour stocker les alertes
    await this.prisma.job.create({
      data: {
        type: 'MATCH_NOTIFICATION', // Ou créer un nouveau type MATCH_ALERT
        status: 'COMPLETED',
        data: {
          alertType: alertData.type,
          matchId: alertData.matchId,
          tournamentId: alertData.tournamentId,
          severity: alertData.severity,
          message: alertData.message,
          ...alertData.metadata,
        },
        result: {
          createdAt: new Date(),
        },
      },
    });

    this.logger.log(`Alert created: ${alertData.type} for match ${alertData.matchId}`);
  }

  /**
   * Hooks Bull
   */

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(`Processing job ${job.id} for match ${job.data.matchId}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    this.logger.debug(
      `Job ${job.id} completed for match ${job.data.matchId}: ${result.action}`,
    );
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Job ${job.id} failed for match ${job.data.matchId}: ${error.message}`,
      error.stack,
    );
  }
}

/**
 * EXEMPLE D'UTILISATION:
 *
 * 1. Quand un match démarre (transition vers ONGOING):
 *
 * ```typescript
 * import { InjectQueue } from '@nestjs/bull';
 * import { Queue } from 'bull';
 *
 * @Injectable()
 * export class MatchService {
 *   constructor(
 *     @InjectQueue('match-monitor') private matchMonitorQueue: Queue,
 *   ) {}
 *
 *   async startMatch(matchId: string) {
 *     // ... transition vers ONGOING
 *
 *     // Ajouter un job de monitoring qui s'exécute toutes les 5 minutes
 *     await this.matchMonitorQueue.add(
 *       'check-timeout',
 *       {
 *         matchId,
 *         startedAt: new Date(),
 *         expectedDuration: 120, // 2 heures (BO3)
 *         warningThreshold: 1.2, // Alerte à 120% (2h24)
 *         criticalThreshold: 1.5, // Critique à 150% (3h)
 *       },
 *       {
 *         repeat: {
 *           every: 5 * 60 * 1000, // Toutes les 5 minutes
 *         },
 *         jobId: `monitor-${matchId}`, // Unique job ID pour éviter les doublons
 *       },
 *     );
 *   }
 *
 *   async completeMatch(matchId: string) {
 *     // ... transition vers COMPLETED
 *
 *     // Supprimer le job de monitoring
 *     await this.matchMonitorQueue.removeRepeatableByKey(`monitor-${matchId}`);
 *   }
 * }
 * ```
 *
 * 2. Configuration du module:
 *
 * ```typescript
 * @Module({
 *   imports: [
 *     BullModule.registerQueue({
 *       name: 'match-monitor',
 *     }),
 *   ],
 *   providers: [MatchMonitorProcessor, MatchStateMachine],
 * })
 * export class TournamentModule {}
 * ```
 */
