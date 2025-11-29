/**
 * EXEMPLE COMPLET D'UTILISATION
 * Workflow complet : Création tournoi → Planning → Démarrage match → Monitoring
 */

import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '@/common/prisma/prisma.service';
import { SchedulerService } from '@/modules/tournament/services/scheduler.service';
import { MatchStateMachine } from '@/modules/tournament/state-machines/match.state-machine';
import { MatchToSchedule, Venue } from '@/modules/tournament/types/scheduling.types';

@Injectable()
export class TournamentWorkflowExample {
  constructor(
    private prisma: PrismaService,
    private schedulerService: SchedulerService,
    private stateMachine: MatchStateMachine,
    @InjectQueue('match-monitor') private matchMonitorQueue: Queue,
  ) {}

  /**
   * SCÉNARIO COMPLET
   */
  async runCompleteWorkflow() {
    // ============================================
    // 1. CRÉER UN TOURNOI
    // ============================================
    console.log('📝 Step 1: Creating tournament...');

    const tournament = await this.prisma.tournament.create({
      data: {
        name: 'Summer Championship 2025',
        description: 'Valorant tournament for top teams',
        game: 'Valorant',
        type: 'SINGLE_ELIMINATION',
        status: 'DRAFT',
        visibility: 'PUBLIC',
        organizerId: 'user-organizer-123',
        maxParticipants: 8,
        entryFee: 50,
        prizePool: 2000,
        registrationStart: new Date('2025-06-01'),
        registrationEnd: new Date('2025-06-10'),
        startDate: new Date('2025-06-15T09:00:00Z'),
        endDate: new Date('2025-06-15T22:00:00Z'),
        rules: {
          matchFormat: 'BO3',
          maps: ['Haven', 'Bind', 'Ascent'],
          overtime: true,
        },
        prizes: {
          distribution: {
            '1st': 1000,
            '2nd': 600,
            '3rd': 400,
          },
        },
      },
    });

    console.log(`✅ Tournament created: ${tournament.id}`);

    // ============================================
    // 2. ENREGISTRER LES PARTICIPANTS
    // ============================================
    console.log('👥 Step 2: Registering participants...');

    const participants = await Promise.all([
      this.prisma.participant.create({
        data: {
          tournamentId: tournament.id,
          userId: 'user-player-1',
          teamName: 'Team Alpha',
          status: 'CONFIRMED',
          seed: 1,
        },
      }),
      this.prisma.participant.create({
        data: {
          tournamentId: tournament.id,
          userId: 'user-player-2',
          teamName: 'Team Beta',
          status: 'CONFIRMED',
          seed: 2,
        },
      }),
      // ... 6 autres participants
    ]);

    console.log(`✅ ${participants.length} participants registered`);

    // ============================================
    // 3. GÉNÉRER LE BRACKET (SINGLE ELIMINATION)
    // ============================================
    console.log('🏆 Step 3: Generating bracket...');

    const matches = await this.generateSingleEliminationBracket(
      tournament.id,
      participants,
    );

    console.log(`✅ ${matches.length} matches created`);

    // ============================================
    // 4. PLANIFICATION INTELLIGENTE
    // ============================================
    console.log('📅 Step 4: Scheduling matches...');

    // Définir les terrains disponibles
    const venues: Venue[] = [
      { id: 'venue-1', name: 'Main Arena', capacity: 100 },
      { id: 'venue-2', name: 'Stage B', capacity: 50 },
    ];

    // Préparer les matchs pour le scheduler
    const matchesToSchedule: MatchToSchedule[] = matches.map((match) => ({
      id: match.id,
      phase: 'playoffs',
      round: match.round,
      participants: [
        { id: match.homeParticipantId!, name: 'Team A' },
        { id: match.awayParticipantId!, name: 'Team B' },
      ],
      estimatedDuration: 120, // BO3 = 2 heures
      preferredVenueId: match.round === 3 ? 'venue-1' : undefined, // Finals sur Main Arena
    }));

    // Exécuter le scheduler
    const schedulingResult = await this.schedulerService.scheduleMatches(
      matchesToSchedule,
      venues,
      {
        minRestTime: 60, // 1 heure de repos minimum
        startTime: new Date('2025-06-15T09:00:00Z'),
        endTime: new Date('2025-06-15T22:00:00Z'),
      },
    );

    console.log(`✅ Scheduling completed!`);
    console.log(`   - Quality score: ${(schedulingResult.metrics.qualityScore * 100).toFixed(0)}%`);
    console.log(`   - Venue utilization: ${(schedulingResult.metrics.venueUtilization * 100).toFixed(0)}%`);
    console.log(`   - Average rest time: ${schedulingResult.metrics.averageRestTime.toFixed(0)} minutes`);

    // Sauvegarder les horaires dans la DB
    for (const scheduledMatch of schedulingResult.scheduledMatches) {
      await this.prisma.match.update({
        where: { id: scheduledMatch.id },
        data: {
          scheduledAt: scheduledMatch.scheduledAt,
          metadata: {
            venueId: scheduledMatch.venueId,
            estimatedDuration: scheduledMatch.estimatedDuration,
          },
        },
      });
    }

    // ============================================
    // 5. DÉMARRER LE TOURNOI
    // ============================================
    console.log('🚀 Step 5: Starting tournament...');

    await this.prisma.tournament.update({
      where: { id: tournament.id },
      data: { status: 'IN_PROGRESS' },
    });

    console.log(`✅ Tournament is now live!`);

    // ============================================
    // 6. DÉMARRER UN MATCH (avec State Machine)
    // ============================================
    console.log('⚡ Step 6: Starting first match...');

    const firstMatch = schedulingResult.scheduledMatches[0];

    // 6a. Marquer le match comme READY
    const readyResult = await this.stateMachine.markAsReady(
      firstMatch.id,
      'referee-123',
    );
    console.log(`   - Match marked as READY: ${readyResult.success}`);

    // 6b. Démarrer le match (READY → ONGOING)
    const startResult = await this.stateMachine.startMatch(
      firstMatch.id,
      'referee-123',
    );
    console.log(`   - Match started: ${startResult.success}`);

    // ============================================
    // 7. ACTIVER LE MONITORING AUTOMATIQUE
    // ============================================
    console.log('👁️  Step 7: Activating match monitoring...');

    await this.matchMonitorQueue.add(
      'check-timeout',
      {
        matchId: firstMatch.id,
        startedAt: new Date(),
        expectedDuration: 120, // 2 heures
        warningThreshold: 1.2, // Alerte à 2h24
        criticalThreshold: 1.5, // Critique à 3h
      },
      {
        repeat: {
          every: 5 * 60 * 1000, // Vérifier toutes les 5 minutes
        },
        jobId: `monitor-${firstMatch.id}`,
      },
    );

    console.log(`✅ Monitoring job scheduled (every 5 minutes)`);

    // ============================================
    // 8. SIMULER LA COMPLÉTION DU MATCH
    // ============================================
    console.log('🏁 Step 8: Completing match...');

    // Mise à jour du score (dans un vrai scénario, fait par le referee)
    await this.prisma.match.update({
      where: { id: firstMatch.id },
      data: {
        homeScore: 2,
        awayScore: 1,
        winnerId: firstMatch.homeParticipantId,
      },
    });

    // Transition vers COMPLETED
    const completeResult = await this.stateMachine.completeMatch(
      firstMatch.id,
      'referee-123',
    );
    console.log(`   - Match completed: ${completeResult.success}`);

    // Arrêter le monitoring
    const repeatableJobs = await this.matchMonitorQueue.getRepeatableJobs();
    const monitorJob = repeatableJobs.find((j) => j.id === `monitor-${firstMatch.id}`);
    if (monitorJob) {
      await this.matchMonitorQueue.removeRepeatableByKey(monitorJob.key);
      console.log(`✅ Monitoring stopped`);
    }

    // ============================================
    // 9. CONSULTER L'HISTORIQUE DES TRANSITIONS
    // ============================================
    console.log('📜 Step 9: Viewing state transition history...');

    const history = await this.stateMachine.getTransitionHistory(firstMatch.id);
    console.log(`   - Transitions: ${history.length}`);
    history.forEach((transition, idx) => {
      console.log(
        `     ${idx + 1}. ${transition.from} → ${transition.to} (by ${transition.triggeredBy})`,
      );
    });

    // ============================================
    // 10. RÉSUMÉ FINAL
    // ============================================
    console.log('\n🎉 WORKFLOW COMPLETED SUCCESSFULLY!\n');
    console.log('Summary:');
    console.log(`  - Tournament ID: ${tournament.id}`);
    console.log(`  - Matches scheduled: ${schedulingResult.scheduledMatches.length}`);
    console.log(`  - First match completed: ${firstMatch.id}`);
    console.log(`  - Quality score: ${(schedulingResult.metrics.qualityScore * 100).toFixed(0)}%`);

    return {
      tournament,
      schedulingResult,
      firstMatchHistory: history,
    };
  }

  /**
   * HELPER: Générer un bracket Single Elimination
   */
  private async generateSingleEliminationBracket(
    tournamentId: string,
    participants: any[],
  ) {
    const numParticipants = participants.length;
    const numRounds = Math.ceil(Math.log2(numParticipants));
    const matches = [];

    // Round 1 (Quart de finale pour 8 participants)
    for (let i = 0; i < numParticipants / 2; i++) {
      const match = await this.prisma.match.create({
        data: {
          tournamentId,
          round: 1,
          matchNumber: i + 1,
          bestOf: 3,
          status: 'SCHEDULED',
          homeParticipantId: participants[i * 2].id,
          awayParticipantId: participants[i * 2 + 1].id,
        },
      });
      matches.push(match);
    }

    // Rounds suivants (créer les matchs vides, les participants seront assignés après)
    for (let round = 2; round <= numRounds; round++) {
      const numMatchesInRound = Math.pow(2, numRounds - round);
      for (let i = 0; i < numMatchesInRound; i++) {
        const match = await this.prisma.match.create({
          data: {
            tournamentId,
            round,
            matchNumber: i + 1,
            bestOf: round === numRounds ? 5 : 3, // Finals en BO5
            status: 'SCHEDULED',
            // Participants seront assignés après les matchs précédents
          },
        });
        matches.push(match);
      }
    }

    return matches;
  }
}

/**
 * UTILISATION:
 *
 * ```typescript
 * // Dans un controller ou un service
 * const workflow = new TournamentWorkflowExample(
 *   prisma,
 *   schedulerService,
 *   stateMachine,
 *   matchMonitorQueue
 * );
 *
 * const result = await workflow.runCompleteWorkflow();
 * ```
 *
 * OUTPUT ATTENDU:
 *
 * 📝 Step 1: Creating tournament...
 * ✅ Tournament created: tournament-abc-123
 * 👥 Step 2: Registering participants...
 * ✅ 8 participants registered
 * 🏆 Step 3: Generating bracket...
 * ✅ 7 matches created
 * 📅 Step 4: Scheduling matches...
 * ✅ Scheduling completed!
 *    - Quality score: 82%
 *    - Venue utilization: 85%
 *    - Average rest time: 90 minutes
 * 🚀 Step 5: Starting tournament...
 * ✅ Tournament is now live!
 * ⚡ Step 6: Starting first match...
 *    - Match marked as READY: true
 *    - Match started: true
 * 👁️  Step 7: Activating match monitoring...
 * ✅ Monitoring job scheduled (every 5 minutes)
 * 🏁 Step 8: Completing match...
 *    - Match completed: true
 * ✅ Monitoring stopped
 * 📜 Step 9: Viewing state transition history...
 *    - Transitions: 3
 *      1. PENDING → READY (by referee-123)
 *      2. READY → ONGOING (by referee-123)
 *      3. ONGOING → COMPLETED (by referee-123)
 *
 * 🎉 WORKFLOW COMPLETED SUCCESSFULLY!
 */
