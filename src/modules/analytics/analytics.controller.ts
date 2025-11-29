import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryService } from './services/analytics-query.service';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly analyticsQuery: AnalyticsQueryService,
  ) {}

  @Get('top-players/kills')
  @ApiOperation({ summary: 'Get top 10 players by kills' })
  async getTopKillers(@Query('game') game?: string) {
    return this.analyticsQuery.getTop10PlayersByKills(game);
  }

  @Get('top-players/goals')
  @ApiOperation({ summary: 'Get top 10 players by goals' })
  async getTopScorers(@Query('game') game?: string) {
    return this.analyticsQuery.getTop10PlayersByGoals(game);
  }

  @Get('player/:id/performance')
  @ApiOperation({ summary: 'Get player detailed performance' })
  async getPlayerPerformance(
    @Param('id') userId: string,
    @Query('game') game?: string,
  ) {
    return this.analyticsQuery.getPlayerPerformance(userId, game);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get global leaderboard with win rate' })
  async getLeaderboard(@Query('limit') limit: number = 100) {
    return this.analyticsQuery.getGlobalLeaderboard(limit);
  }

  @Get('stats-by-game')
  @ApiOperation({ summary: 'Get statistics grouped by game' })
  async getStatsByGame() {
    return this.analyticsQuery.getStatsByGame();
  }

  @Get('high-performers')
  @ApiOperation({ summary: 'Find players with exceptional performance' })
  async getHighPerformers(@Query('minKills') minKills: number = 20) {
    return this.analyticsQuery.findPlayersWithHighKills(minKills);
  }
}
