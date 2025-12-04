import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { AnalyticsService } from '../analytics.service';
import { Parser } from 'json2csv';

@Injectable()
export class ExportService {
  constructor(
    private prisma: PrismaService,
    private analyticsService: AnalyticsService,
  ) {}

  /**
   * Export tournament analytics to CSV
   */
  async exportTournamentAnalyticsCSV(tournamentId: string): Promise<string> {
    const analytics = await this.analyticsService.getTournamentAnalytics(
      tournamentId,
    );

    // Prepare participant data for CSV
    const participantData = analytics.participants.map((p) => ({
      Username: p.user.username,
      TeamName: p.teamName || 'N/A',
      Seed: p.seed || 'N/A',
      Wins: p.wins,
      Losses: p.losses,
      'Win Rate': p.winRate.toFixed(2) + '%',
      Status: p.status,
      'Checked In At': p.checkedInAt || 'Not checked in',
    }));

    // Prepare matches data for CSV
    const matchesData = analytics.matches.map((m) => ({
      'Match #': m.matchNumber,
      Round: m.round,
      'Home Player': m.homeParticipant?.user?.username || 'TBD',
      'Away Player': m.awayParticipant?.user?.username || 'TBD',
      Score: `${m.homeScore} - ${m.awayScore}`,
      Winner: m.winner?.user?.username || 'TBD',
      Status: m.status,
      'Completed At': m.completedAt || 'Not completed',
    }));

    // Prepare top performers data
    const topPerformersData = analytics.topPerformers.map((p) => ({
      Rank: p.rank,
      Player: p.player.username,
      Wins: p.wins,
      Losses: p.losses,
      'Win Rate': p.winRate.toFixed(2) + '%',
    }));

    // Combine all data
    const csvData = {
      'Tournament Info': [
        {
          Name: analytics.tournament.name,
          Game: analytics.tournament.game,
          Type: analytics.tournament.type,
          Status: analytics.tournament.status,
          'Total Participants': analytics.totalParticipants,
          'Checked In': analytics.checkedInCount,
          'Total Matches': analytics.totalMatches,
          'Completed Matches': analytics.completedMatches,
          'Entry Fee': analytics.tournament.entryFee,
          'Prize Pool': analytics.tournament.prizePool,
          'Start Date': analytics.tournament.startDate,
        },
      ],
      Participants: participantData,
      Matches: matchesData,
      'Top Performers': topPerformersData,
    };

    // Convert to CSV
    let csv = '';

    // Add Tournament Info section
    csv += '=== TOURNAMENT INFORMATION ===\n';
    const infoParser = new Parser({ fields: Object.keys(csvData['Tournament Info'][0]) });
    csv += infoParser.parse(csvData['Tournament Info']) + '\n\n';

    // Add Participants section
    csv += '=== PARTICIPANTS ===\n';
    if (participantData.length > 0) {
      const participantsParser = new Parser({ fields: Object.keys(participantData[0]) });
      csv += participantsParser.parse(participantData) + '\n\n';
    }

    // Add Matches section
    csv += '=== MATCHES ===\n';
    if (matchesData.length > 0) {
      const matchesParser = new Parser({ fields: Object.keys(matchesData[0]) });
      csv += matchesParser.parse(matchesData) + '\n\n';
    }

    // Add Top Performers section
    csv += '=== TOP PERFORMERS ===\n';
    if (topPerformersData.length > 0) {
      const topPerformersParser = new Parser({ fields: Object.keys(topPerformersData[0]) });
      csv += topPerformersParser.parse(topPerformersData) + '\n';
    }

    return csv;
  }

  /**
   * Export player performance to CSV
   */
  async exportPlayerPerformanceCSV(userId: string): Promise<string> {
    const performance = await this.analyticsService.getPlayerPerformance(userId);

    const csvData = [
      {
        Player: performance.player.username,
        'Total Tournaments': performance.tournamentsPlayed,
        'Total Matches': performance.totalMatches,
        Wins: performance.wins,
        Losses: performance.losses,
        'Win Rate': performance.winRate.toFixed(2) + '%',
        'Best Placement': performance.bestPlacement || 'N/A',
        'Average Placement': performance.averagePlacement?.toFixed(2) || 'N/A',
        'Current Streak': performance.currentStreak,
        'Recent Form': performance.recentFormPercentage?.toFixed(2) + '%',
      },
    ];

    const parser = new Parser({ fields: Object.keys(csvData[0]) });
    return parser.parse(csvData);
  }

  /**
   * Export global leaderboard to CSV
   */
  async exportLeaderboardCSV(limit = 100, game?: string): Promise<string> {
    const leaderboard = await this.analyticsService.getGlobalLeaderboard(
      limit,
      game,
    );

    const csvData = leaderboard.map((entry) => ({
      Rank: entry.rank,
      Player: entry.player.username,
      'Total Matches': entry.totalMatches,
      Wins: entry.wins,
      Losses: entry.losses,
      'Win Rate': entry.winRate.toFixed(2) + '%',
      'Tournaments Played': entry.tournamentsPlayed,
      'Best Placement': entry.bestPlacement || 'N/A',
    }));

    const parser = new Parser({ fields: Object.keys(csvData[0]) });
    return parser.parse(csvData);
  }

  /**
   * Export revenue analytics to CSV (admin only)
   */
  async exportRevenueAnalyticsCSV(
    period: 'day' | 'week' | 'month' | 'year',
  ): Promise<string> {
    const revenue = await this.analyticsService.getRevenueAnalytics(period);

    const summaryData = [
      {
        Period: period,
        'Total Revenue': '$' + revenue.totalRevenue.toFixed(2),
        'Entry Fees': '$' + revenue.entryFees.toFixed(2),
        'Total Transactions': revenue.totalTransactions,
        'Active Tournaments': revenue.activeTournaments,
        'Completed Tournaments': revenue.completedTournaments,
        'Total Prize Pool': '$' + revenue.totalPrizePool.toFixed(2),
        'Prizes Awarded': '$' + revenue.prizesAwarded.toFixed(2),
        'Platform Fee Revenue':
          '$' + (revenue.entryFees - revenue.prizesAwarded).toFixed(2),
      },
    ];

    let csv = '=== REVENUE SUMMARY ===\n';
    const summaryParser = new Parser({ fields: Object.keys(summaryData[0]) });
    csv += summaryParser.parse(summaryData) + '\n\n';

    // Add top spenders
    if (revenue.topSpenders && revenue.topSpenders.length > 0) {
      csv += '=== TOP SPENDERS ===\n';
      const spendersData = revenue.topSpenders.map((s, index) => ({
        Rank: index + 1,
        Player: s.user.username,
        'Total Spent': '$' + s.totalSpent.toFixed(2),
        'Tournaments Entered': s.tournamentsEntered,
        'Average Entry': '$' + s.averageEntry.toFixed(2),
      }));
      const spendersParser = new Parser({ fields: Object.keys(spendersData[0]) });
      csv += spendersParser.parse(spendersData) + '\n\n';
    }

    // Add revenue by game
    if (revenue.revenueByGame && revenue.revenueByGame.length > 0) {
      csv += '=== REVENUE BY GAME ===\n';
      const gameData = revenue.revenueByGame.map((g) => ({
        Game: g.game,
        Revenue: '$' + g.revenue.toFixed(2),
        Tournaments: g.tournaments,
        Participants: g.participants,
      }));
      const gameParser = new Parser({ fields: Object.keys(gameData[0]) });
      csv += gameParser.parse(gameData) + '\n';
    }

    return csv;
  }

  /**
   * Prepare tournament analytics data for PDF generation (frontend will generate PDF)
   */
  async getTournamentAnalyticsForPDF(tournamentId: string) {
    const analytics = await this.analyticsService.getTournamentAnalytics(
      tournamentId,
    );

    return {
      tournament: {
        name: analytics.tournament.name,
        game: analytics.tournament.game,
        type: analytics.tournament.type,
        status: analytics.tournament.status,
        entryFee: analytics.tournament.entryFee,
        prizePool: analytics.tournament.prizePool,
        startDate: analytics.tournament.startDate,
        organizer: analytics.tournament.organizer,
      },
      summary: {
        totalParticipants: analytics.totalParticipants,
        checkedInCount: analytics.checkedInCount,
        totalMatches: analytics.totalMatches,
        completedMatches: analytics.completedMatches,
        completionRate: analytics.completionRate,
        averageMatchDuration: analytics.averageMatchDuration,
      },
      participants: analytics.participants.map((p) => ({
        username: p.user.username,
        avatar: p.user.avatar,
        teamName: p.teamName,
        seed: p.seed,
        wins: p.wins,
        losses: p.losses,
        winRate: p.winRate,
        status: p.status,
      })),
      topPerformers: analytics.topPerformers.map((p) => ({
        rank: p.rank,
        username: p.player.username,
        avatar: p.player.avatar,
        wins: p.wins,
        losses: p.losses,
        winRate: p.winRate,
      })),
      matches: analytics.matches.map((m) => ({
        matchNumber: m.matchNumber,
        round: m.round,
        homePlayer: m.homeParticipant?.user?.username,
        awayPlayer: m.awayParticipant?.user?.username,
        score: `${m.homeScore} - ${m.awayScore}`,
        winner: m.winner?.user?.username,
        status: m.status,
        completedAt: m.completedAt,
      })),
      timeline: analytics.timeline,
      engagement: {
        peakConcurrentMatches: analytics.engagement.peakConcurrentMatches,
        averageMatchDuration: analytics.engagement.averageMatchDuration,
      },
    };
  }
}
