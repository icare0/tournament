import { Module } from '@nestjs/common';
import { TournamentService } from './tournament.service';
import { TournamentController } from './tournament.controller';
import { MatchService } from './services/match.service';
import { ParticipantService } from './services/participant.service';
import { PhaseService } from './services/phase.service';

@Module({
  controllers: [TournamentController],
  providers: [
    TournamentService,
    MatchService,
    ParticipantService,
    PhaseService,
  ],
  exports: [TournamentService],
})
export class TournamentModule {}
