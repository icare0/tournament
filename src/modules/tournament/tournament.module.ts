import { Module } from '@nestjs/common';
import { TournamentService } from './tournament.service';
import { TournamentController, MatchController } from './tournament.controller';

@Module({
  controllers: [TournamentController, MatchController],
  providers: [TournamentService],
  exports: [TournamentService],
})
export class TournamentModule {}
