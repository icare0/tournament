import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { TournamentStatus, MatchStatus } from '@prisma/client';

export interface TournamentAnalytics {
  tournamentId: string;
  tournamentName: string;
  totalParticipants: number;
  totalMatches: number;
  completedMatches: number;
  liveMatches: number;
  upcomingMatches: number;
  averageMatchDuration: number; // in minutes
  participantEngagement: number; // percentage
  topPerformers: Array<{
    participantId: string;
    username: string;
    wins: number;
    losses: number;
    winRate: number;
    totalScore: number;
  }>;
  matchStatusDistribution: {
    scheduled: number;
    live: number;
    completed: number;
    cancelled: number;
    disputed: number;
  };
  timeline: Array<{
    date: string;
    matchesCompleted: number;
  }>;
}

export interface PlayerPerformanceMetrics {
  playerId: string;
  username: string;
  totalTournaments: number;
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  averageScore: number;
  bestPerformance: {
    tournamentName: string;
    score: number;
    placement: number;
  };
  recentForm: Array<{
    matchId: string;
    date: Date;
    result: 'win' | 'loss';
    score: number;
  }>;
  gameStats: Record<string, any>; // Flexible stats per game
}

export interface GlobalLeaderboard {
  rank: number;
  playerId: string;
  username: string;
  avatar?: string;
  totalWins: number;
  totalLosses: number;
  winRate: number;
  tournamentsPlayed: number;
  totalScore: number;
  avgPlacement: number;
}

export interface RevenueAnalytics {
  period: 'day' | 'week' | 'month' | 'year';
  totalRevenue: number;
  totalTransactions: number;
  averageTransactionValue: number;
  revenueByType: {
    tournamentEntries: number;
    deposits: number;
    fees: number;
  };
  topSpendingUsers: Array<{
    userId: string;
    username: string;
    totalSpent: number;
  }>;
}

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get comprehensive analytics for a specific tournament (for organizers)
   */
  async getTournamentAnalytics(
    tournamentId: string,
  ): Promise<TournamentAnalytics> {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, username: true, avatar: true },
            },
            homeMatches: { where: { status: MatchStatus.COMPLETED } },
            awayMatches: { where: { status: MatchStatus.COMPLETED } },
          },
        },
        matches: {
          include: {
            homeParticipant: true,
            awayParticipant: true,
          },
        },
      },
    });

    if (!tournament) {
      throw new Error('Tournament not found');
    }

    // Calculate match statistics
    const totalMatches = tournament.matches.length;
    const completedMatches = tournament.matches.filter(
      (m) => m.status === MatchStatus.COMPLETED,
    ).length;
    const liveMatches = tournament.matches.filter(
      (m) => m.status === MatchStatus.LIVE,
    ).length;
    const upcomingMatches = tournament.matches.filter(
      (m) => m.status === MatchStatus.SCHEDULED,
    ).length;

    // Calculate average match duration
    const completedMatchesWithDuration = tournament.matches.filter(
      (m) =>
        m.status === MatchStatus.COMPLETED &&
        m.startedAt &&
        m.completedAt,
    );
    const averageMatchDuration =
      completedMatchesWithDuration.length > 0
        ? completedMatchesWithDuration.reduce((sum, match) => {
            const duration =
              (match.completedAt!.getTime() - match.startedAt!.getTime()) /
              1000 /
              60;
            return sum + duration;
          }, 0) / completedMatchesWithDuration.length
        : 0;

    // Calculate top performers
    const topPerformers = tournament.participants
      .map((participant) => {
        const homeWins = participant.homeMatches.filter(
          (m) => m.winnerId === participant.id,
        ).length;
        const awayWins = participant.awayMatches.filter(
          (m) => m.winnerId === participant.id,
        ).length;
        const wins = homeWins + awayWins;

        const homeLosses = participant.homeMatches.filter(
          (m) => m.winnerId && m.winnerId !== participant.id,
        ).length;
        const awayLosses = participant.awayMatches.filter(
          (m) => m.winnerId && m.winnerId !== participant.id,
        ).length;
        const losses = homeLosses + awayLosses;

        const totalGames = wins + losses;
        const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

        // Calculate total score from matches
        const homeScore = participant.homeMatches.reduce(
          (sum, m) => sum + (m.homeScore || 0),
          0,
        );
        const awayScore = participant.awayMatches.reduce(
          (sum, m) => sum + (m.awayScore || 0),
          0,
        );
        const totalScore = homeScore + awayScore;

        return {
          participantId: participant.id,
          username: participant.user.username,
          wins,
          losses,
          winRate,
          totalScore,
        };
      })
      .sort((a, b) => {
        // Sort by win rate, then by total wins
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        return b.wins - a.wins;
      })
      .slice(0, 10);

    // Match status distribution
    const matchStatusDistribution = {
      scheduled: tournament.matches.filter(
        (m) => m.status === MatchStatus.SCHEDULED,
      ).length,
      live: tournament.matches.filter((m) => m.status === MatchStatus.LIVE)
        .length,
      completed: completedMatches,
      cancelled: tournament.matches.filter(
        (m) => m.status === MatchStatus.CANCELLED,
      ).length,
      disputed: tournament.matches.filter(
        (m) => m.status === MatchStatus.DISPUTED,
      ).length,
    };

    // Timeline of completed matches (last 7 days or tournament duration)
    const completedMatchesByDate = tournament.matches
      .filter((m) => m.status === MatchStatus.COMPLETED && m.completedAt)
      .reduce((acc, match) => {
        const date = match.completedAt!.toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const timeline = Object.entries(completedMatchesByDate)
      .map(([date, count]) => ({
        date,
        matchesCompleted: count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Participant engagement (checked in / total)
    const checkedInParticipants = tournament.participants.filter(
      (p) => p.status === 'CHECKED_IN' || p.status === 'CONFIRMED',
    ).length;
    const participantEngagement =
      tournament.participants.length > 0
        ? (checkedInParticipants / tournament.participants.length) * 100
        : 0;

    return {
      tournamentId: tournament.id,
      tournamentName: tournament.name,
      totalParticipants: tournament.participants.length,
      totalMatches,
      completedMatches,
      liveMatches,
      upcomingMatches,
      averageMatchDuration,
      participantEngagement,
      topPerformers,
      matchStatusDistribution,
      timeline,
    };
  }

  /**
   * Get player performance metrics across all tournaments
   */
  async getPlayerPerformance(
    userId: string,
  ): Promise<PlayerPerformanceMetrics> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        participants: {
          include: {
            tournament: true,
            homeMatches: {
              where: { status: MatchStatus.COMPLETED },
              orderBy: { completedAt: 'desc' },
              take: 10,
            },
            awayMatches: {
              where: { status: MatchStatus.COMPLETED },
              orderBy: { completedAt: 'desc' },
              take: 10,
            },
          },
        },
        gameStats: {
          include: {
            match: true,
            participant: {
              include: {
                tournament: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const totalTournaments = user.participants.length;

    // Calculate wins and losses
    let wins = 0;
    let losses = 0;
    let totalScore = 0;
    let totalMatches = 0;

    user.participants.forEach((participant) => {
      const homeWins = participant.homeMatches.filter(
        (m) => m.winnerId === participant.id,
      ).length;
      const awayWins = participant.awayMatches.filter(
        (m) => m.winnerId === participant.id,
      ).length;
      wins += homeWins + awayWins;

      const homeLosses = participant.homeMatches.filter(
        (m) => m.winnerId && m.winnerId !== participant.id,
      ).length;
      const awayLosses = participant.awayMatches.filter(
        (m) => m.winnerId && m.winnerId !== participant.id,
      ).length;
      losses += homeLosses + awayLosses;

      totalMatches +=
        participant.homeMatches.length + participant.awayMatches.length;

      // Sum scores
      participant.homeMatches.forEach((m) => {
        totalScore += m.homeScore || 0;
      });
      participant.awayMatches.forEach((m) => {
        totalScore += m.awayScore || 0;
      });
    });

    const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;
    const averageScore = totalMatches > 0 ? totalScore / totalMatches : 0;

    // Find best performance
    let bestPerformance = {
      tournamentName: 'N/A',
      score: 0,
      placement: 0,
    };

    if (user.participants.length > 0) {
      const bestParticipant = user.participants.reduce((best, current) => {
        return (current.finalRank || 999) < (best.finalRank || 999)
          ? current
          : best;
      });

      bestPerformance = {
        tournamentName: bestParticipant.tournament.name,
        score: bestParticipant.wins || 0,
        placement: bestParticipant.finalRank || 0,
      };
    }

    // Recent form (last 10 matches)
    const recentMatches = [
      ...user.participants.flatMap((p) =>
        p.homeMatches.map((m) => ({
          matchId: m.id,
          date: m.completedAt!,
          result: m.winnerId === p.id ? ('win' as const) : ('loss' as const),
          score: m.homeScore || 0,
        })),
      ),
      ...user.participants.flatMap((p) =>
        p.awayMatches.map((m) => ({
          matchId: m.id,
          date: m.completedAt!,
          result: m.winnerId === p.id ? ('win' as const) : ('loss' as const),
          score: m.awayScore || 0,
        })),
      ),
    ]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10);

    // Aggregate game stats
    const gameStats = user.gameStats.reduce((acc, stat) => {
      const game = stat.participant.tournament.game;
      if (!acc[game]) {
        acc[game] = {
          totalMatches: 0,
          stats: {},
        };
      }
      acc[game].totalMatches++;

      // Aggregate stats from JSONB
      Object.entries(stat.stats as Record<string, any>).forEach(
        ([key, value]) => {
          if (typeof value === 'number') {
            acc[game].stats[key] = (acc[game].stats[key] || 0) + value;
          }
        },
      );

      return acc;
    }, {} as Record<string, any>);

    return {
      playerId: user.id,
      username: user.username,
      totalTournaments,
      totalMatches,
      wins,
      losses,
      winRate,
      averageScore,
      bestPerformance,
      recentForm: recentMatches,
      gameStats,
    };
  }

  /**
   * Get global leaderboard across all tournaments
   */
  async getGlobalLeaderboard(
    limit: number = 100,
    game?: string,
  ): Promise<GlobalLeaderboard[]> {
    const participants = await this.prisma.participant.findMany({
      where: game
        ? {
            tournament: {
              game,
              status: {
                in: [TournamentStatus.COMPLETED, TournamentStatus.IN_PROGRESS],
              },
            },
          }
        : {
            tournament: {
              status: {
                in: [TournamentStatus.COMPLETED, TournamentStatus.IN_PROGRESS],
              },
            },
          },
      include: {
        user: {
          select: { id: true, username: true, avatar: true },
        },
        homeMatches: {
          where: { status: MatchStatus.COMPLETED },
        },
        awayMatches: {
          where: { status: MatchStatus.COMPLETED },
        },
        tournament: true,
      },
    });

    // Aggregate stats per user
    const userStats = participants.reduce((acc, participant) => {
      const userId = participant.user.id;

      if (!acc[userId]) {
        acc[userId] = {
          playerId: userId,
          username: participant.user.username,
          avatar: participant.user.avatar,
          totalWins: 0,
          totalLosses: 0,
          tournamentsPlayed: new Set(),
          totalScore: 0,
          placements: [],
        };
      }

      // Count wins
      const homeWins = participant.homeMatches.filter(
        (m) => m.winnerId === participant.id,
      ).length;
      const awayWins = participant.awayMatches.filter(
        (m) => m.winnerId === participant.id,
      ).length;
      acc[userId].totalWins += homeWins + awayWins;

      // Count losses
      const homeLosses = participant.homeMatches.filter(
        (m) => m.winnerId && m.winnerId !== participant.id,
      ).length;
      const awayLosses = participant.awayMatches.filter(
        (m) => m.winnerId && m.winnerId !== participant.id,
      ).length;
      acc[userId].totalLosses += homeLosses + awayLosses;

      // Track tournaments
      acc[userId].tournamentsPlayed.add(participant.tournament.id);

      // Sum scores
      participant.homeMatches.forEach((m) => {
        acc[userId].totalScore += m.homeScore || 0;
      });
      participant.awayMatches.forEach((m) => {
        acc[userId].totalScore += m.awayScore || 0;
      });

      // Track placements
      if (participant.finalRank) {
        acc[userId].placements.push(participant.finalRank);
      }

      return acc;
    }, {} as Record<string, any>);

    // Convert to array and calculate final metrics
    const leaderboard = Object.values(userStats)
      .map((stats: any) => {
        const totalGames = stats.totalWins + stats.totalLosses;
        const winRate = totalGames > 0 ? (stats.totalWins / totalGames) * 100 : 0;
        const avgPlacement =
          stats.placements.length > 0
            ? stats.placements.reduce((sum: number, rank: number) => sum + rank, 0) /
              stats.placements.length
            : 0;

        return {
          playerId: stats.playerId,
          username: stats.username,
          avatar: stats.avatar,
          totalWins: stats.totalWins,
          totalLosses: stats.totalLosses,
          winRate,
          tournamentsPlayed: stats.tournamentsPlayed.size,
          totalScore: stats.totalScore,
          avgPlacement,
        };
      })
      .sort((a, b) => {
        // Sort by win rate, then by total wins
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        return b.totalWins - a.totalWins;
      })
      .slice(0, limit)
      .map((player, index) => ({
        rank: index + 1,
        ...player,
      }));

    return leaderboard;
  }

  /**
   * Get revenue analytics for platform admin
   */
  async getRevenueAnalytics(
    period: 'day' | 'week' | 'month' | 'year' = 'month',
  ): Promise<RevenueAnalytics> {
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const transactions = await this.prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
        status: 'COMPLETED',
      },
      include: {
        wallet: {
          include: {
            user: {
              select: { id: true, username: true },
            },
          },
        },
      },
    });

    const totalRevenue = transactions
      .filter((t) => t.entryType === 'CREDIT')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalTransactions = transactions.length;
    const averageTransactionValue =
      totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Revenue by type
    const revenueByType = {
      tournamentEntries: transactions
        .filter((t) => t.type === 'TOURNAMENT_ENTRY' && t.entryType === 'CREDIT')
        .reduce((sum, t) => sum + Number(t.amount), 0),
      deposits: transactions
        .filter((t) => t.type === 'DEPOSIT')
        .reduce((sum, t) => sum + Number(t.amount), 0),
      fees: transactions
        .filter((t) => t.type === 'FEE' && t.entryType === 'CREDIT')
        .reduce((sum, t) => sum + Number(t.amount), 0),
    };

    // Top spending users
    const userSpending = transactions
      .filter((t) => t.entryType === 'DEBIT')
      .reduce((acc, t) => {
        const userId = t.wallet.user.id;
        const username = t.wallet.user.username;
        if (!acc[userId]) {
          acc[userId] = { userId, username, totalSpent: 0 };
        }
        acc[userId].totalSpent += Number(t.amount);
        return acc;
      }, {} as Record<string, { userId: string; username: string; totalSpent: number }>);

    const topSpendingUsers = Object.values(userSpending)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    return {
      period,
      totalRevenue,
      totalTransactions,
      averageTransactionValue,
      revenueByType,
      topSpendingUsers,
    };
  }

  /**
   * Get match analytics (duration, scoring patterns, etc.)
   */
  async getMatchAnalytics(matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeParticipant: {
          include: { user: true },
        },
        awayParticipant: {
          include: { user: true },
        },
        tournament: true,
        gameStats: {
          include: { user: true },
        },
      },
    });

    if (!match) {
      throw new Error('Match not found');
    }

    const duration =
      match.startedAt && match.completedAt
        ? (match.completedAt.getTime() - match.startedAt.getTime()) / 1000 / 60
        : null;

    return {
      matchId: match.id,
      tournament: {
        id: match.tournament.id,
        name: match.tournament.name,
      },
      status: match.status,
      homeParticipant: {
        username: match.homeParticipant.user.username,
        score: match.homeScore,
      },
      awayParticipant: {
        username: match.awayParticipant.user.username,
        score: match.awayScore,
      },
      winner: match.winnerId
        ? match.winnerId === match.homeParticipantId
          ? match.homeParticipant.user.username
          : match.awayParticipant.user.username
        : null,
      duration,
      scheduledAt: match.scheduledAt,
      startedAt: match.startedAt,
      completedAt: match.completedAt,
      detailedStats: match.gameStats.map((stat) => ({
        username: stat.user.username,
        stats: stat.stats,
        performanceScore: stat.performanceScore,
      })),
    };
  }

  /**
   * Get trending tournaments (most popular, most active)
   */
  async getTrendingTournaments(limit: number = 10) {
    const tournaments = await this.prisma.tournament.findMany({
      where: {
        status: {
          in: [
            TournamentStatus.REGISTRATION_OPEN,
            TournamentStatus.IN_PROGRESS,
          ],
        },
        visibility: 'PUBLIC',
      },
      include: {
        participants: true,
        matches: {
          where: {
            status: MatchStatus.COMPLETED,
            completedAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
        },
        organizer: {
          select: { id: true, username: true, avatar: true },
        },
      },
      take: limit,
    });

    return tournaments
      .map((tournament) => ({
        tournamentId: tournament.id,
        name: tournament.name,
        game: tournament.game,
        type: tournament.type,
        status: tournament.status,
        totalParticipants: tournament.participants.length,
        maxParticipants: tournament.maxParticipants,
        recentActivity: tournament.matches.length,
        organizer: tournament.organizer,
        startDate: tournament.startDate,
        prizePool: tournament.prizePool,
      }))
      .sort((a, b) => {
        // Sort by recent activity, then by participant count
        if (b.recentActivity !== a.recentActivity)
          return b.recentActivity - a.recentActivity;
        return b.totalParticipants - a.totalParticipants;
      });
  }
}
