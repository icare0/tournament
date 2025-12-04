import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import {
  MatchStatus,
  TournamentType,
  TournamentStatus,
  ParticipantStatus,
} from '@prisma/client';

export interface UpdateMatchScoreDto {
  matchId: string;
  homeScore: number;
  awayScore: number;
  winnerId?: string;
}

@Injectable()
export class MatchService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate bracket for tournament
   */
  async generateBracket(tournamentId: string) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        participants: {
          where: {
            status: {
              in: [ParticipantStatus.CHECKED_IN, ParticipantStatus.CONFIRMED],
            },
          },
          orderBy: { seed: 'asc' },
        },
      },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    if (tournament.participants.length < 2) {
      throw new BadRequestException('At least 2 participants required');
    }

    // Delete existing matches
    await this.prisma.match.deleteMany({ where: { tournamentId } });

    let matches: any[] = [];

    switch (tournament.type) {
      case TournamentType.SINGLE_ELIMINATION:
        matches = await this.generateSingleEliminationBracket(tournament);
        break;
      case TournamentType.ROUND_ROBIN:
        matches = await this.generateRoundRobinBracket(tournament);
        break;
      default:
        matches = await this.generateSingleEliminationBracket(tournament);
    }

    await this.prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: TournamentStatus.REGISTRATION_CLOSED },
    });

    return {
      success: true,
      matchesCreated: matches.length,
      message: 'Bracket generated successfully',
    };
  }

  private async generateSingleEliminationBracket(tournament: any) {
    const participants = tournament.participants;
    const numParticipants = participants.length;
    const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(numParticipants)));
    const numRounds = Math.log2(nextPowerOf2);
    const matches: any[] = [];

    let matchNumber = 1;
    let participantIndex = 0;

    for (let i = 0; i < nextPowerOf2 / 2; i++) {
      const homeParticipant =
        participantIndex < numParticipants ? participants[participantIndex++] : null;
      const awayParticipant =
        participantIndex < numParticipants ? participants[participantIndex++] : null;

      if (homeParticipant && awayParticipant) {
        matches.push(
          await this.prisma.match.create({
            data: {
              tournamentId: tournament.id,
              round: 1,
              matchNumber: matchNumber++,
              bestOf: 1,
              status: MatchStatus.SCHEDULED,
              homeParticipantId: homeParticipant.id,
              awayParticipantId: awayParticipant.id,
            },
          }),
        );
      } else if (homeParticipant) {
        matches.push(
          await this.prisma.match.create({
            data: {
              tournamentId: tournament.id,
              round: 1,
              matchNumber: matchNumber++,
              bestOf: 1,
              status: MatchStatus.COMPLETED,
              homeParticipantId: homeParticipant.id,
              homeScore: 1,
              winnerId: homeParticipant.id,
            },
          }),
        );
      }
    }

    for (let round = 2; round <= numRounds; round++) {
      const matchesInRound = nextPowerOf2 / Math.pow(2, round);
      for (let i = 0; i < matchesInRound; i++) {
        matches.push(
          await this.prisma.match.create({
            data: {
              tournamentId: tournament.id,
              round,
              matchNumber: i + 1,
              bestOf: round === numRounds ? 3 : 1,
              status: MatchStatus.SCHEDULED,
            },
          }),
        );
      }
    }

    return matches;
  }

  private async generateRoundRobinBracket(tournament: any) {
    const participants = tournament.participants;
    const matches: any[] = [];
    let matchNumber = 1;

    for (let i = 0; i < participants.length; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        matches.push(
          await this.prisma.match.create({
            data: {
              tournamentId: tournament.id,
              round: 1,
              matchNumber: matchNumber++,
              bestOf: 1,
              status: MatchStatus.SCHEDULED,
              homeParticipantId: participants[i].id,
              awayParticipantId: participants[j].id,
            },
          }),
        );
      }
    }

    return matches;
  }

  async updateMatchScore(dto: UpdateMatchScoreDto) {
    const { matchId, homeScore, awayScore, winnerId } = dto;

    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: { tournament: true, homeParticipant: true, awayParticipant: true },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    let determinedWinnerId = winnerId;
    if (!determinedWinnerId) {
      const requiredWins = Math.ceil(match.bestOf / 2);
      if (homeScore >= requiredWins) {
        determinedWinnerId = match.homeParticipantId!;
      } else if (awayScore >= requiredWins) {
        determinedWinnerId = match.awayParticipantId!;
      }
    }

    const updated = await this.prisma.match.update({
      where: { id: matchId },
      data: {
        homeScore,
        awayScore,
        winnerId: determinedWinnerId,
        status: determinedWinnerId ? MatchStatus.COMPLETED : MatchStatus.LIVE,
        startedAt: match.startedAt || new Date(),
        completedAt: determinedWinnerId ? new Date() : null,
      },
    });

    if (determinedWinnerId) {
      const loserId =
        determinedWinnerId === match.homeParticipantId
          ? match.awayParticipantId
          : match.homeParticipantId;

      await Promise.all([
        this.prisma.participant.update({
          where: { id: determinedWinnerId },
          data: { wins: { increment: 1 } },
        }),
        loserId
          ? this.prisma.participant.update({
              where: { id: loserId },
              data: { losses: { increment: 1 } },
            })
          : Promise.resolve(),
      ]);

      if (match.tournament.type === TournamentType.SINGLE_ELIMINATION) {
        await this.advanceWinnerToNextRound(match, determinedWinnerId);
      }
    }

    return { success: true, match: updated };
  }

  private async advanceWinnerToNextRound(match: any, winnerId: string) {
    const nextRound = match.round + 1;
    const nextMatchNumber = Math.ceil(match.matchNumber / 2);

    const nextMatch = await this.prisma.match.findFirst({
      where: {
        tournamentId: match.tournamentId,
        round: nextRound,
        matchNumber: nextMatchNumber,
      },
    });

    if (nextMatch) {
      const isHomeSlot = match.matchNumber % 2 === 1;

      await this.prisma.match.update({
        where: { id: nextMatch.id },
        data: {
          [isHomeSlot ? 'homeParticipantId' : 'awayParticipantId']: winnerId,
        },
      });
    }
  }

  async startMatch(matchId: string) {
    return this.prisma.match.update({
      where: { id: matchId },
      data: { status: MatchStatus.LIVE, startedAt: new Date() },
    });
  }
}
