import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BroadcastService } from './broadcast.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Broadcast')
@Controller('broadcast')
export class BroadcastController {
  constructor(private readonly broadcastService: BroadcastService) {}

  @Get('match/:id')
  @ApiOperation({
    summary: 'Get real-time match data for broadcast overlays',
    description: 'Returns match details, scores, timer for streaming overlays',
  })
  async getMatchBroadcastData(@Param('id') matchId: string) {
    return this.broadcastService.getMatchBroadcastData(matchId);
  }

  @Get('tournament/:id')
  @ApiOperation({
    summary: 'Get tournament broadcast data',
    description: 'Returns live matches, upcoming matches, recent results',
  })
  async getTournamentBroadcastData(@Param('id') tournamentId: string) {
    return this.broadcastService.getTournamentBroadcastData(tournamentId);
  }

  @Get('tournament/:id/leaderboard')
  @ApiOperation({
    summary: 'Get real-time tournament leaderboard',
    description: 'Returns ranked participants with scores for broadcast',
  })
  async getTournamentLeaderboard(
    @Param('id') tournamentId: string,
    @Query('limit') limit: number = 10,
  ) {
    return this.broadcastService.getTournamentLeaderboard(tournamentId, limit);
  }

  @Get('match/:id/scoreboard')
  @ApiOperation({
    summary: 'Get detailed match scoreboard',
    description: 'Returns player stats, team scores for in-game overlays',
  })
  async getMatchScoreboard(@Param('id') matchId: string) {
    return this.broadcastService.getMatchScoreboard(matchId);
  }

  @Post('match/:id/score')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update match score (organizer/referee only)',
    description: 'Updates match score in real-time for broadcast overlays',
  })
  async updateMatchScore(
    @Param('id') matchId: string,
    @Body() scoreDto: { homeScore: number; awayScore: number },
  ) {
    return this.broadcastService.updateMatchScore(
      matchId,
      scoreDto.homeScore,
      scoreDto.awayScore,
    );
  }

  @Get('tournament/:id/overlay-config')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get broadcast overlay configuration',
    description: 'Returns overlay URLs and setup instructions for OBS/Streamlabs',
  })
  async getBroadcastOverlayConfig(
    @Param('id') tournamentId: string,
    @Query('type')
    overlayType:
      | 'scoreboard'
      | 'leaderboard'
      | 'upcoming'
      | 'results'
      | 'tournament_info'
      | 'match' = 'tournament_info',
  ) {
    return this.broadcastService.getBroadcastOverlayConfig(
      tournamentId,
      overlayType,
    );
  }
}
