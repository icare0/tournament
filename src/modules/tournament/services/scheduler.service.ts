import { Injectable, Logger } from '@nestjs/common';
import {
  SchedulingConstraints,
  MatchToSchedule,
  ScheduledMatch,
  Venue,
  TimelineSlot,
  SlotCandidate,
  SchedulingResult,
  ScheduleMetrics,
} from '../types/scheduling.types';

/**
 * Service de planification intelligente de matchs
 * Implémente un algorithme Greedy avec Backtracking
 */
@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  // Timelines pour tracking des disponibilités
  private venueTimeline: Map<string, TimelineSlot[]>;
  private participantTimeline: Map<string, Date | null>;

  /**
   * Point d'entrée principal : Planifier tous les matchs
   */
  async scheduleMatches(
    matches: MatchToSchedule[],
    venues: Venue[],
    constraints: SchedulingConstraints,
  ): Promise<SchedulingResult> {
    this.logger.log(
      `Starting scheduling for ${matches.length} matches across ${venues.length} venues`,
    );

    // Validation préliminaire
    this.validateInputs(matches, venues, constraints);

    // Initialisation des timelines
    this.venueTimeline = this.initializeVenueTimeline(venues);
    this.participantTimeline = this.initializeParticipantTimeline(matches);

    // Tri des matchs par priorité (stratégie gloutonne)
    const sortedMatches = this.sortMatchesByPriority(matches);

    const scheduledMatches: ScheduledMatch[] = [];
    const warnings: string[] = [];

    // Planification gloutonne
    for (const match of sortedMatches) {
      const bestSlot = this.findBestTimeSlot(
        match,
        this.venueTimeline,
        this.participantTimeline,
        constraints,
      );

      if (!bestSlot) {
        // Backtracking: Essayer de réorganiser
        this.logger.warn(
          `No slot found for match ${match.id}, attempting backtracking...`,
        );

        const success = this.tryBacktracking(
          match,
          scheduledMatches,
          this.venueTimeline,
          this.participantTimeline,
          constraints,
          0,
        );

        if (!success) {
          const error = `Impossible to schedule match ${match.id}`;
          this.logger.error(error);
          throw new Error(error);
        }

        // Le backtracking a réussi, le match est déjà ajouté
        continue;
      }

      // Assigner le créneau
      const scheduledMatch: ScheduledMatch = {
        ...match,
        scheduledAt: bestSlot.startTime,
        venueId: bestSlot.venueId,
        endTime: bestSlot.endTime,
      };

      // Mettre à jour les timelines
      this.updateVenueTimeline(
        this.venueTimeline,
        bestSlot.venueId,
        bestSlot.startTime,
        match.estimatedDuration,
        match.id,
      );

      this.updateParticipantTimeline(
        this.participantTimeline,
        match.participants,
        bestSlot.endTime,
      );

      scheduledMatches.push(scheduledMatch);

      this.logger.debug(
        `Scheduled match ${match.id} at ${bestSlot.startTime.toISOString()} on venue ${bestSlot.venueId}`,
      );
    }

    // Calculer les métriques de qualité
    const metrics = this.evaluateScheduleQuality(
      scheduledMatches,
      venues,
      constraints,
    );

    this.logger.log(
      `Scheduling completed. Quality score: ${metrics.qualityScore.toFixed(2)}`,
    );

    return {
      scheduledMatches,
      metrics,
      warnings,
    };
  }

  /**
   * Trouve le meilleur créneau pour un match donné
   */
  private findBestTimeSlot(
    match: MatchToSchedule,
    venueTimeline: Map<string, TimelineSlot[]>,
    participantTimeline: Map<string, Date | null>,
    constraints: SchedulingConstraints,
  ): SlotCandidate | null {
    const candidates: SlotCandidate[] = [];

    // Calculer l'heure de début minimale
    let minStartTime = new Date(constraints.startTime);

    // Vérifier le temps de repos des participants
    for (const participant of match.participants) {
      const lastMatchEnd = participantTimeline.get(participant.id);
      if (lastMatchEnd) {
        const restEndTime = new Date(
          lastMatchEnd.getTime() + constraints.minRestTime * 60000,
        );
        if (restEndTime > minStartTime) {
          minStartTime = restEndTime;
        }
      }
    }

    // Pour chaque terrain, trouver le premier créneau disponible
    for (const [venueId, timeline] of venueTimeline.entries()) {
      const availableSlot = this.findNextAvailableSlot(
        timeline,
        minStartTime,
        match.estimatedDuration,
        constraints.endTime,
      );

      if (availableSlot) {
        const score = this.calculateSlotScore(
          availableSlot,
          match,
          venueId,
          venueTimeline,
          participantTimeline,
        );

        candidates.push({
          startTime: availableSlot.startTime,
          endTime: availableSlot.endTime,
          venueId,
          score,
        });
      }
    }

    // Retourner le meilleur candidat
    if (candidates.length === 0) {
      return null;
    }

    candidates.sort((a, b) => b.score - a.score);
    return candidates[0];
  }

  /**
   * Trouve le prochain créneau disponible sur un terrain
   */
  private findNextAvailableSlot(
    occupiedSlots: TimelineSlot[],
    minStartTime: Date,
    duration: number,
    maxEndTime: Date,
  ): { startTime: Date; endTime: Date } | null {
    const durationMs = duration * 60000; // Convertir minutes en millisecondes

    // Cas 1: Aucun match programmé
    if (occupiedSlots.length === 0) {
      const endTime = new Date(minStartTime.getTime() + durationMs);
      if (endTime <= maxEndTime) {
        return { startTime: minStartTime, endTime };
      }
      return null;
    }

    // Cas 2: Vérifier avant le premier match
    const firstSlot = occupiedSlots[0];
    const beforeFirstEnd = new Date(minStartTime.getTime() + durationMs);
    if (beforeFirstEnd <= firstSlot.startTime) {
      return { startTime: minStartTime, endTime: beforeFirstEnd };
    }

    // Cas 3: Chercher un trou entre deux matchs
    for (let i = 0; i < occupiedSlots.length - 1; i++) {
      const currentSlot = occupiedSlots[i];
      const nextSlot = occupiedSlots[i + 1];

      const gapStart =
        currentSlot.endTime > minStartTime ? currentSlot.endTime : minStartTime;
      const gapEnd = nextSlot.startTime;
      const gapDuration = gapEnd.getTime() - gapStart.getTime();

      if (gapDuration >= durationMs) {
        return {
          startTime: gapStart,
          endTime: new Date(gapStart.getTime() + durationMs),
        };
      }
    }

    // Cas 4: Placer après le dernier match
    const lastSlot = occupiedSlots[occupiedSlots.length - 1];
    const afterLastStart =
      lastSlot.endTime > minStartTime ? lastSlot.endTime : minStartTime;
    const afterLastEnd = new Date(afterLastStart.getTime() + durationMs);

    if (afterLastEnd <= maxEndTime) {
      return { startTime: afterLastStart, endTime: afterLastEnd };
    }

    return null;
  }

  /**
   * Calcule un score de qualité pour un créneau (heuristique)
   */
  private calculateSlotScore(
    slot: { startTime: Date; endTime: Date },
    match: MatchToSchedule,
    venueId: string,
    venueTimeline: Map<string, TimelineSlot[]>,
    participantTimeline: Map<string, Date | null>,
  ): number {
    let score = 0;

    // Critère 1: Horaires premium (10h-18h)
    const hour = slot.startTime.getHours();
    if (hour >= 10 && hour <= 18) {
      score += 100;
    } else if (hour >= 8 && hour <= 20) {
      score += 50;
    }

    // Critère 2: Combler les trous (minimiser temps morts)
    if (this.isFillingGap(slot, venueTimeline.get(venueId)!)) {
      score += 200;
    }

    // Critère 3: Équité - ne pas surcharger les participants
    const participantLoad = this.getParticipantLoadAtTime(
      slot.startTime,
      match.participants.map((p) => p.id),
      participantTimeline,
    );
    score -= participantLoad * 10;

    // Critère 4: Préférence de terrain
    if (match.preferredVenueId === venueId) {
      score += 50;
    }

    // Critère 5: Priorité du match
    if (match.priority) {
      score += match.priority * 10;
    }

    return score;
  }

  /**
   * Vérifie si un créneau comble un trou dans le calendrier
   */
  private isFillingGap(
    slot: { startTime: Date; endTime: Date },
    timeline: TimelineSlot[],
  ): boolean {
    if (timeline.length === 0) return false;

    for (let i = 0; i < timeline.length - 1; i++) {
      const current = timeline[i];
      const next = timeline[i + 1];

      if (
        slot.startTime >= current.endTime &&
        slot.endTime <= next.startTime
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Calcule la charge des participants à un moment donné
   */
  private getParticipantLoadAtTime(
    time: Date,
    participantIds: string[],
    timeline: Map<string, Date | null>,
  ): number {
    let load = 0;

    for (const participantId of participantIds) {
      const lastMatchEnd = timeline.get(participantId);
      if (lastMatchEnd) {
        const timeSinceLastMatch = time.getTime() - lastMatchEnd.getTime();
        const hoursSinceLastMatch = timeSinceLastMatch / (1000 * 60 * 60);

        // Plus le dernier match est récent, plus la charge est élevée
        if (hoursSinceLastMatch < 2) {
          load += 3;
        } else if (hoursSinceLastMatch < 4) {
          load += 1;
        }
      }
    }

    return load;
  }

  /**
   * Backtracking: Réorganiser les matchs si nécessaire
   */
  private tryBacktracking(
    currentMatch: MatchToSchedule,
    scheduledMatches: ScheduledMatch[],
    venueTimeline: Map<string, TimelineSlot[]>,
    participantTimeline: Map<string, Date | null>,
    constraints: SchedulingConstraints,
    depth: number,
  ): boolean {
    // Limite de profondeur pour éviter explosion combinatoire
    if (depth > 5) {
      this.logger.warn('Backtracking depth limit reached');
      return false;
    }

    // Essayer de décaler un match précédent
    for (let i = scheduledMatches.length - 1; i >= 0; i--) {
      const previousMatch = scheduledMatches[i];

      // Sauvegarder l'état
      const originalSlot = {
        startTime: previousMatch.scheduledAt,
        venueId: previousMatch.venueId,
        endTime: previousMatch.endTime,
      };

      // Retirer ce match du calendrier
      this.removeFromTimeline(previousMatch, venueTimeline, participantTimeline);

      // Essayer de placer le match courant
      const slotForCurrent = this.findBestTimeSlot(
        currentMatch,
        venueTimeline,
        participantTimeline,
        constraints,
      );

      if (slotForCurrent) {
        // Assigner le match courant
        const scheduledCurrent: ScheduledMatch = {
          ...currentMatch,
          scheduledAt: slotForCurrent.startTime,
          venueId: slotForCurrent.venueId,
          endTime: slotForCurrent.endTime,
        };

        this.updateVenueTimeline(
          venueTimeline,
          slotForCurrent.venueId,
          slotForCurrent.startTime,
          currentMatch.estimatedDuration,
          currentMatch.id,
        );

        this.updateParticipantTimeline(
          participantTimeline,
          currentMatch.participants,
          slotForCurrent.endTime,
        );

        scheduledMatches.push(scheduledCurrent);

        // Essayer de replacer le match précédent
        const slotForPrevious = this.findBestTimeSlot(
          previousMatch,
          venueTimeline,
          participantTimeline,
          constraints,
        );

        if (slotForPrevious) {
          // Succès !
          previousMatch.scheduledAt = slotForPrevious.startTime;
          previousMatch.venueId = slotForPrevious.venueId;
          previousMatch.endTime = slotForPrevious.endTime;

          this.updateVenueTimeline(
            venueTimeline,
            slotForPrevious.venueId,
            slotForPrevious.startTime,
            previousMatch.estimatedDuration,
            previousMatch.id,
          );

          this.updateParticipantTimeline(
            participantTimeline,
            previousMatch.participants,
            slotForPrevious.endTime,
          );

          this.logger.debug(
            `Backtracking successful: moved match ${previousMatch.id}`,
          );
          return true;
        }

        // Échec, annuler le match courant
        scheduledMatches.pop();
        this.removeFromTimeline(scheduledCurrent, venueTimeline, participantTimeline);
      }

      // Restaurer le match précédent
      this.updateVenueTimeline(
        venueTimeline,
        originalSlot.venueId,
        originalSlot.startTime,
        previousMatch.estimatedDuration,
        previousMatch.id,
      );

      this.updateParticipantTimeline(
        participantTimeline,
        previousMatch.participants,
        originalSlot.endTime,
      );
    }

    return false;
  }

  /**
   * Trie les matchs par priorité (stratégie gloutonne)
   */
  private sortMatchesByPriority(matches: MatchToSchedule[]): MatchToSchedule[] {
    return [...matches].sort((a, b) => {
      // 1. Phase importance
      const phaseOrder = this.getPhaseImportance(a.phase || '') -
                        this.getPhaseImportance(b.phase || '');
      if (phaseOrder !== 0) return phaseOrder;

      // 2. Round number (DESC)
      if (a.round !== b.round) return b.round - a.round;

      // 3. Priority override
      const aPriority = a.priority || 0;
      const bPriority = b.priority || 0;
      return bPriority - aPriority;
    });
  }

  /**
   * Retourne l'importance d'une phase (plus haut = plus important)
   */
  private getPhaseImportance(phase: string): number {
    const phaseMap: Record<string, number> = {
      finals: 100,
      'semi-finals': 90,
      semis: 90,
      'quarter-finals': 80,
      quarters: 80,
      playoffs: 70,
      'group-stage': 50,
      groups: 50,
      qualifier: 30,
    };

    return phaseMap[phase.toLowerCase()] || 0;
  }

  /**
   * Initialise la timeline des terrains
   */
  private initializeVenueTimeline(venues: Venue[]): Map<string, TimelineSlot[]> {
    const timeline = new Map<string, TimelineSlot[]>();
    for (const venue of venues) {
      timeline.set(venue.id, []);
    }
    return timeline;
  }

  /**
   * Initialise la timeline des participants
   */
  private initializeParticipantTimeline(
    matches: MatchToSchedule[],
  ): Map<string, Date | null> {
    const timeline = new Map<string, Date | null>();
    for (const match of matches) {
      for (const participant of match.participants) {
        if (!timeline.has(participant.id)) {
          timeline.set(participant.id, null);
        }
      }
    }
    return timeline;
  }

  /**
   * Met à jour la timeline d'un terrain
   */
  private updateVenueTimeline(
    venueTimeline: Map<string, TimelineSlot[]>,
    venueId: string,
    startTime: Date,
    duration: number,
    matchId: string,
  ): void {
    const timeline = venueTimeline.get(venueId)!;
    const endTime = new Date(startTime.getTime() + duration * 60000);

    timeline.push({
      startTime,
      endTime,
      matchId,
    });

    // Garder trié par startTime
    timeline.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  /**
   * Met à jour la timeline des participants
   */
  private updateParticipantTimeline(
    participantTimeline: Map<string, Date | null>,
    participants: Array<{ id: string }>,
    endTime: Date,
  ): void {
    for (const participant of participants) {
      participantTimeline.set(participant.id, endTime);
    }
  }

  /**
   * Retire un match des timelines
   */
  private removeFromTimeline(
    match: ScheduledMatch,
    venueTimeline: Map<string, TimelineSlot[]>,
    participantTimeline: Map<string, Date | null>,
  ): void {
    // Retirer du terrain
    const timeline = venueTimeline.get(match.venueId)!;
    const index = timeline.findIndex((slot) => slot.matchId === match.id);
    if (index !== -1) {
      timeline.splice(index, 1);
    }

    // Retirer des participants (simplification: on met null)
    for (const participant of match.participants) {
      participantTimeline.set(participant.id, null);
    }
  }

  /**
   * Évalue la qualité du calendrier généré
   */
  private evaluateScheduleQuality(
    scheduledMatches: ScheduledMatch[],
    venues: Venue[],
    constraints: SchedulingConstraints,
  ): ScheduleMetrics {
    // 1. Utilisation des terrains
    const totalDuration = scheduledMatches.reduce(
      (sum, m) => sum + m.estimatedDuration,
      0,
    );
    const timeWindowMs =
      constraints.endTime.getTime() - constraints.startTime.getTime();
    const availableCapacity = (timeWindowMs / 60000) * venues.length; // minutes
    const venueUtilization = totalDuration / availableCapacity;

    // 2. Temps de repos moyen
    let totalRestTime = 0;
    let restCount = 0;

    for (const participant of this.participantTimeline.keys()) {
      const participantMatches = scheduledMatches
        .filter((m) => m.participants.some((p) => p.id === participant))
        .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());

      for (let i = 0; i < participantMatches.length - 1; i++) {
        const restTime =
          participantMatches[i + 1].scheduledAt.getTime() -
          participantMatches[i].endTime.getTime();
        totalRestTime += restTime / 60000; // en minutes
        restCount++;
      }
    }

    const averageRestTime = restCount > 0 ? totalRestTime / restCount : 0;

    // 3. Peak load time (simplification: on prend le premier match)
    const peakLoadTime = scheduledMatches[0]?.scheduledAt || constraints.startTime;

    // 4. Contraintes violées (pour l'instant, 0 car on throw si violation)
    const constraintViolations = 0;

    // Score de qualité global (0-1)
    const qualityScore =
      venueUtilization * 0.3 +
      Math.min(averageRestTime / constraints.minRestTime, 1) * 0.3 +
      0.2 + // Peak load (simplification)
      (1 - constraintViolations) * 0.2;

    return {
      venueUtilization,
      averageRestTime,
      peakLoadTime,
      constraintViolations,
      qualityScore,
    };
  }

  /**
   * Valide les inputs avant la planification
   */
  private validateInputs(
    matches: MatchToSchedule[],
    venues: Venue[],
    constraints: SchedulingConstraints,
  ): void {
    if (matches.length === 0) {
      throw new Error('No matches to schedule');
    }

    if (venues.length === 0) {
      throw new Error('No venues available');
    }

    if (constraints.startTime >= constraints.endTime) {
      throw new Error('Invalid time window: startTime must be before endTime');
    }

    // Vérifier capacité théorique
    const totalDuration = matches.reduce(
      (sum, m) => sum + m.estimatedDuration,
      0,
    );
    const timeWindowMs =
      constraints.endTime.getTime() - constraints.startTime.getTime();
    const availableCapacity = (timeWindowMs / 60000) * venues.length;

    if (totalDuration > availableCapacity * 0.9) {
      this.logger.warn(
        `Tight schedule: ${totalDuration}min needed, ${availableCapacity}min available`,
      );
    }
  }
}
