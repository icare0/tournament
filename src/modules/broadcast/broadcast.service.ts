import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { MatchStatus, TournamentStatus } from '@prisma/client';

export interface BroadcastMatchData {
  matchId: string;
  tournamentName: string;
  status: MatchStatus;
  homePlayer: {
    username: string;
    avatar?: string;
    score: number;
  };
  awayPlayer: {
    username: string;
    avatar?: string;
    score: number;
  };
  bestOf: number;
  round: string;
  scheduledAt: Date | null;
  startedAt: Date | null;
  timer: {
    elapsed: number; // seconds
    formattedTime: string; // "MM:SS"
  } | null;
}

export interface BroadcastTournamentData {
  tournamentId: string;
  name: string;
  game: string;
  status: TournamentStatus;
  currentRound: string;
  totalParticipants: number;
  remainingParticipants: number;
  completedMatches: number;
  totalMatches: number;
  liveMatches: BroadcastMatchData[];
  upcomingMatches: BroadcastMatchData[];
  recentResults: Array<{
    matchId: string;
    homePlayer: string;
    awayPlayer: string;
    winner: string;
    score: string;
  }>;
}

export interface BroadcastLeaderboard {
  rank: number;
  username: string;
  avatar?: string;
  wins: number;
  losses: number;
  score: number;
  winRate: number;
}

export interface BroadcastScoreboard {
  matchId: string;
  homeTeam: {
    name: string;
    score: number;
    players: Array<{
      username: string;
      stats: {
        kills?: number;
        deaths?: number;
        assists?: number;
        [key: string]: any;
      };
    }>;
  };
  awayTeam: {
    name: string;
    score: number;
    players: Array<{
      username: string;
      stats: {
        kills?: number;
        deaths?: number;
        assists?: number;
        [key: string]: any;
      };
    }>;
  };
  timer: string;
  round: string;
}

@Injectable()
export class BroadcastService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get real-time match data for broadcast overlays
   */
  async getMatchBroadcastData(matchId: string): Promise<BroadcastMatchData> {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        tournament: true,
        homeParticipant: {
          include: { user: true },
        },
        awayParticipant: {
          include: { user: true },
        },
        phase: true,
      },
    });

    if (!match) {
      throw new Error('Match not found');
    }

    // Calculate timer if match is live
    let timer = null;
    if (match.status === MatchStatus.LIVE && match.startedAt) {
      const elapsed = Math.floor(
        (Date.now() - match.startedAt.getTime()) / 1000,
      );
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      timer = {
        elapsed,
        formattedTime: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
      };
    }

    return {
      matchId: match.id,
      tournamentName: match.tournament.name,
      status: match.status,
      homePlayer: {
        username: match.homeParticipant.user.username,
        avatar: match.homeParticipant.user.avatar,
        score: match.homeScore || 0,
      },
      awayPlayer: {
        username: match.awayParticipant.user.username,
        avatar: match.awayParticipant.user.avatar,
        score: match.awayScore || 0,
      },
      bestOf: match.bestOf,
      round: match.phase?.name || match.round || 'Unknown',
      scheduledAt: match.scheduledAt,
      startedAt: match.startedAt,
      timer,
    };
  }

  /**
   * Get tournament broadcast data with live and upcoming matches
   */
  async getTournamentBroadcastData(
    tournamentId: string,
  ): Promise<BroadcastTournamentData> {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        participants: true,
        matches: {
          include: {
            homeParticipant: { include: { user: true } },
            awayParticipant: { include: { user: true } },
            phase: true,
          },
          orderBy: { scheduledAt: 'asc' },
        },
      },
    });

    if (!tournament) {
      throw new Error('Tournament not found');
    }

    // Get live matches
    const liveMatches = await Promise.all(
      tournament.matches
        .filter((m) => m.status === MatchStatus.LIVE)
        .slice(0, 5)
        .map((m) => this.getMatchBroadcastData(m.id)),
    );

    // Get upcoming matches
    const upcomingMatches = await Promise.all(
      tournament.matches
        .filter((m) => m.status === MatchStatus.SCHEDULED)
        .slice(0, 5)
        .map((m) => this.getMatchBroadcastData(m.id)),
    );

    // Get recent results
    const recentResults = tournament.matches
      .filter(
        (m) =>
          m.status === MatchStatus.COMPLETED &&
          m.completedAt &&
          m.winnerId,
      )
      .sort(
        (a, b) =>
          (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0),
      )
      .slice(0, 5)
      .map((m) => ({
        matchId: m.id,
        homePlayer: m.homeParticipant.user.username,
        awayPlayer: m.awayParticipant.user.username,
        winner:
          m.winnerId === m.homeParticipantId
            ? m.homeParticipant.user.username
            : m.awayParticipant.user.username,
        score: `${m.homeScore}-${m.awayScore}`,
      }));

    // Calculate remaining participants (not eliminated)
    const remainingParticipants = tournament.participants.filter(
      (p) => p.status !== 'ELIMINATED',
    ).length;

    // Determine current round
    const currentRound =
      liveMatches.length > 0
        ? liveMatches[0].round
        : upcomingMatches.length > 0
          ? upcomingMatches[0].round
          : 'Finals';

    return {
      tournamentId: tournament.id,
      name: tournament.name,
      game: tournament.game,
      status: tournament.status,
      currentRound,
      totalParticipants: tournament.participants.length,
      remainingParticipants,
      completedMatches: tournament.matches.filter(
        (m) => m.status === MatchStatus.COMPLETED,
      ).length,
      totalMatches: tournament.matches.length,
      liveMatches,
      upcomingMatches,
      recentResults,
    };
  }

  /**
   * Get real-time leaderboard for tournament broadcast
   */
  async getTournamentLeaderboard(
    tournamentId: string,
    limit: number = 10,
  ): Promise<BroadcastLeaderboard[]> {
    const participants = await this.prisma.participant.findMany({
      where: { tournamentId },
      include: {
        user: {
          select: { username: true, avatar: true },
        },
        homeMatches: {
          where: { status: MatchStatus.COMPLETED },
        },
        awayMatches: {
          where: { status: MatchStatus.COMPLETED },
        },
      },
      orderBy: [{ wins: 'desc' }, { losses: 'asc' }],
      take: limit,
    });

    return participants.map((participant, index) => {
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

      // Calculate total score
      const homeScore = participant.homeMatches.reduce(
        (sum, m) => sum + (m.homeScore || 0),
        0,
      );
      const awayScore = participant.awayMatches.reduce(
        (sum, m) => sum + (m.awayScore || 0),
        0,
      );
      const score = homeScore + awayScore;

      return {
        rank: index + 1,
        username: participant.user.username,
        avatar: participant.user.avatar,
        wins,
        losses,
        score,
        winRate,
      };
    });
  }

  /**
   * Get detailed scoreboard for a match (for in-game overlays)
   */
  async getMatchScoreboard(matchId: string): Promise<BroadcastScoreboard> {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeParticipant: {
          include: {
            user: true,
          },
        },
        awayParticipant: {
          include: {
            user: true,
          },
        },
        gameStats: {
          include: {
            user: true,
            participant: true,
          },
        },
        phase: true,
      },
    });

    if (!match) {
      throw new Error('Match not found');
    }

    // Calculate timer
    let timerStr = '--:--';
    if (match.status === MatchStatus.LIVE && match.startedAt) {
      const elapsed = Math.floor(
        (Date.now() - match.startedAt.getTime()) / 1000,
      );
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      timerStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    // Group game stats by team
    const homeStats = match.gameStats
      .filter((stat) => stat.participantId === match.homeParticipantId)
      .map((stat) => ({
        username: stat.user.username,
        stats: stat.stats as Record<string, any>,
      }));

    const awayStats = match.gameStats
      .filter((stat) => stat.participantId === match.awayParticipantId)
      .map((stat) => ({
        username: stat.user.username,
        stats: stat.stats as Record<string, any>,
      }));

    return {
      matchId: match.id,
      homeTeam: {
        name: match.homeParticipant.teamName || match.homeParticipant.user.username,
        score: match.homeScore || 0,
        players: homeStats.length > 0 ? homeStats : [{
          username: match.homeParticipant.user.username,
          stats: {},
        }],
      },
      awayTeam: {
        name: match.awayParticipant.teamName || match.awayParticipant.user.username,
        score: match.awayScore || 0,
        players: awayStats.length > 0 ? awayStats : [{
          username: match.awayParticipant.user.username,
          stats: {},
        }],
      },
      timer: timerStr,
      round: match.phase?.name || match.round || 'Round 1',
    };
  }

  /**
   * Update match score in real-time (for integration with streaming software)
   */
  async updateMatchScore(
    matchId: string,
    homeScore: number,
    awayScore: number,
  ): Promise<BroadcastMatchData> {
    const match = await this.prisma.match.update({
      where: { id: matchId },
      data: {
        homeScore,
        awayScore,
        // Auto-determine winner if bestOf is reached
        winnerId:
          homeScore >= Math.ceil(match.bestOf / 2)
            ? match.homeParticipantId
            : awayScore >= Math.ceil(match.bestOf / 2)
              ? match.awayParticipantId
              : null,
        status:
          homeScore >= Math.ceil(match.bestOf / 2) ||
          awayScore >= Math.ceil(match.bestOf / 2)
            ? MatchStatus.COMPLETED
            : match.status,
        completedAt:
          homeScore >= Math.ceil(match.bestOf / 2) ||
          awayScore >= Math.ceil(match.bestOf / 2)
            ? new Date()
            : null,
      },
      include: {
        tournament: true,
        homeParticipant: true,
        awayParticipant: true,
      },
    });

    return this.getMatchBroadcastData(matchId);
  }

  /**
   * Get broadcast overlay config (URL for OBS Browser Source)
   */
  async getBroadcastOverlayConfig(tournamentId: string, overlayType: string) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const overlayUrls = {
      scoreboard: `${frontendUrl}/broadcast/overlay/scoreboard/${tournamentId}`,
      leaderboard: `${frontendUrl}/broadcast/overlay/leaderboard/${tournamentId}`,
      upcoming: `${frontendUrl}/broadcast/overlay/upcoming/${tournamentId}`,
      results: `${frontendUrl}/broadcast/overlay/results/${tournamentId}`,
      tournament_info: `${frontendUrl}/broadcast/overlay/tournament/${tournamentId}`,
      match: `${frontendUrl}/broadcast/overlay/match`, // Requires match ID in URL
    };

    return {
      tournamentId,
      overlayType,
      url: overlayUrls[overlayType] || overlayUrls.tournament_info,
      instructions: {
        obs: [
          '1. Open OBS Studio',
          '2. Add a new "Browser" source',
          '3. Paste the URL above',
          '4. Set width to 1920 and height to 1080 (or your stream resolution)',
          '5. Check "Shutdown source when not visible" for better performance',
          '6. The overlay will update automatically via WebSocket',
        ],
        streamlabs: [
          '1. Open Streamlabs OBS',
          '2. Add a new "Browser Source"',
          '3. Paste the URL above',
          '4. Set dimensions to match your stream',
          '5. Enable hardware acceleration if available',
        ],
      },
    };
  }
}
