import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryService } from './services/analytics-query.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly analyticsQuery: AnalyticsQueryService,
  ) {}

  // ============================================
  // TOURNAMENT ANALYTICS (For Organizers)
  // ============================================

  @Get('tournaments/:id/analytics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get comprehensive tournament analytics (for organizers)',
    description: 'Returns detailed analytics including participants, matches, top performers, engagement, and timeline'
  })
  async getTournamentAnalytics(@Param('id') tournamentId: string) {
    return this.analyticsService.getTournamentAnalytics(tournamentId);
  }

  @Get('matches/:id/analytics')
  @ApiOperation({ summary: 'Get detailed match analytics' })
  async getMatchAnalytics(@Param('id') matchId: string) {
    return this.analyticsService.getMatchAnalytics(matchId);
  }

  @Get('tournaments/trending')
  @ApiOperation({
    summary: 'Get trending tournaments',
    description: 'Returns most popular and active public tournaments'
  })
  async getTrendingTournaments(@Query('limit') limit: number = 10) {
    return this.analyticsService.getTrendingTournaments(limit);
  }

  // ============================================
  // PLAYER PERFORMANCE
  // ============================================

  @Get('players/:id/performance')
  @ApiOperation({
    summary: 'Get comprehensive player performance metrics',
    description: 'Returns wins, losses, win rate, best performance, recent form, and game-specific stats'
  })
  async getPlayerPerformanceMetrics(@Param('id') userId: string) {
    return this.analyticsService.getPlayerPerformance(userId);
  }

  @Get('player/:id/performance')
  @ApiOperation({ summary: 'Get player detailed performance (legacy)' })
  async getPlayerPerformance(
    @Param('id') userId: string,
    @Query('game') game?: string,
  ) {
    return this.analyticsQuery.getPlayerPerformance(userId, game);
  }

  // ============================================
  // LEADERBOARDS
  // ============================================

  @Get('leaderboard/global')
  @ApiOperation({
    summary: 'Get global leaderboard',
    description: 'Returns ranked players with win rates, total wins, tournaments played'
  })
  async getGlobalLeaderboardDetailed(
    @Query('limit') limit: number = 100,
    @Query('game') game?: string,
  ) {
    return this.analyticsService.getGlobalLeaderboard(limit, game);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get global leaderboard with win rate (legacy)' })
  async getLeaderboard(@Query('limit') limit: number = 100) {
    return this.analyticsQuery.getGlobalLeaderboard(limit);
  }

  // ============================================
  // REVENUE ANALYTICS (Admin Only)
  // ============================================

  @Get('revenue')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get revenue analytics (admin only)',
    description: 'Returns revenue metrics, transactions, and top spending users'
  })
  async getRevenueAnalytics(
    @Query('period') period: 'day' | 'week' | 'month' | 'year' = 'month',
  ) {
    return this.analyticsService.getRevenueAnalytics(period);
  }

  // ============================================
  // GAME-SPECIFIC ANALYTICS
  // ============================================

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
