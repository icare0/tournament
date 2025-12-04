import { Controller, Get, Param, Query, UseGuards, Res, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryService } from './services/analytics-query.service';
import { ExportService } from './services/export.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly analyticsQuery: AnalyticsQueryService,
    private readonly exportService: ExportService,
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

  // ============================================
  // EXPORT ENDPOINTS (CSV/PDF)
  // ============================================

  @Get('export/tournament/:id/csv')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Header('Content-Type', 'text/csv')
  @ApiOperation({
    summary: 'Export tournament analytics to CSV',
    description: 'Downloads comprehensive tournament analytics as CSV file',
  })
  async exportTournamentCSV(@Param('id') tournamentId: string, @Res() res: Response) {
    const csv = await this.exportService.exportTournamentAnalyticsCSV(tournamentId);
    res.setHeader('Content-Disposition', `attachment; filename=tournament-${tournamentId}-analytics.csv`);
    res.send(csv);
  }

  @Get('export/tournament/:id/pdf-data')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get tournament analytics data for PDF generation',
    description: 'Returns structured data for client-side PDF generation',
  })
  async getTournamentPDFData(@Param('id') tournamentId: string) {
    return this.exportService.getTournamentAnalyticsForPDF(tournamentId);
  }

  @Get('export/player/:id/csv')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Header('Content-Type', 'text/csv')
  @ApiOperation({
    summary: 'Export player performance to CSV',
    description: 'Downloads player performance metrics as CSV file',
  })
  async exportPlayerCSV(@Param('id') userId: string, @Res() res: Response) {
    const csv = await this.exportService.exportPlayerPerformanceCSV(userId);
    res.setHeader('Content-Disposition', `attachment; filename=player-${userId}-performance.csv`);
    res.send(csv);
  }

  @Get('export/leaderboard/csv')
  @Header('Content-Type', 'text/csv')
  @ApiOperation({
    summary: 'Export global leaderboard to CSV',
    description: 'Downloads global leaderboard as CSV file',
  })
  async exportLeaderboardCSV(
    @Query('limit') limit: number = 100,
    @Query('game') game: string,
    @Res() res: Response,
  ) {
    const csv = await this.exportService.exportLeaderboardCSV(limit, game);
    res.setHeader('Content-Disposition', `attachment; filename=leaderboard.csv`);
    res.send(csv);
  }

  @Get('export/revenue/csv')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Header('Content-Type', 'text/csv')
  @ApiOperation({
    summary: 'Export revenue analytics to CSV (admin only)',
    description: 'Downloads revenue analytics as CSV file',
  })
  async exportRevenueCSV(
    @Query('period') period: 'day' | 'week' | 'month' | 'year' = 'month',
    @Res() res: Response,
  ) {
    const csv = await this.exportService.exportRevenueAnalyticsCSV(period);
    res.setHeader('Content-Disposition', `attachment; filename=revenue-${period}.csv`);
    res.send(csv);
  }
}
