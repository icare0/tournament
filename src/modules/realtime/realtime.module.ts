import { Module } from '@nestjs/common';
import { TournamentGateway } from './gateways/tournament.gateway';
import { RealtimeService } from './realtime.service';

@Module({
  providers: [TournamentGateway, RealtimeService],
  exports: [TournamentGateway, RealtimeService],
})
export class RealtimeModule {}
