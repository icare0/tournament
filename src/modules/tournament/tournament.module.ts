import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TournamentService } from './tournament.service';
import { TournamentController } from './tournament.controller';
import { MatchService } from './services/match.service';
import { ParticipantService } from './services/participant.service';
import { PhaseService } from './services/phase.service';
import { SchedulerService } from './services/scheduler.service';
import { MatchStateMachine } from './state-machines/match.state-machine';
import { MatchMonitorProcessor } from './processors/match-monitor.processor';

@Module({
  imports: [
    // BullMQ Queue pour le monitoring des matchs
    BullModule.registerQueue({
      name: 'match-monitor',
    }),
  ],
  controllers: [TournamentController],
  providers: [
    TournamentService,
    MatchService,
    ParticipantService,
    PhaseService,
    SchedulerService,
    MatchStateMachine,
    MatchMonitorProcessor,
  ],
  exports: [TournamentService, SchedulerService, MatchStateMachine],
})
export class TournamentModule {}
