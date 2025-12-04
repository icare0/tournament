import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { UserRole, MatchStatus } from '@prisma/client';

export interface AssignRefereeDto {
  tournamentId: string;
  refereeId: string;
}

export interface ReportMatchResultDto {
  matchId: string;
  homeScore: number;
  awayScore: number;
  winnerId: string;
  notes?: string;
  matchData?: any;
}

@Injectable()
export class RefereeService {
  constructor(private prisma: PrismaService) {}

  /**
   * Assign referee to tournament (organizer only)
   */
  async assignReferee(dto: AssignRefereeDto, organizerId: string) {
    const { tournamentId, refereeId } = dto;

    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    if (tournament.organizerId !== organizerId) {
      throw new ForbiddenException('Only organizer can assign referees');
    }

    const referee = await this.prisma.user.findUnique({
      where: { id: refereeId },
    });

    if (!referee) {
      throw new NotFoundException('Referee not found');
    }

    if (referee.role !== UserRole.REFEREE && referee.role !== UserRole.ADMIN) {
      throw new BadRequestException('User must have REFEREE or ADMIN role');
    }

    // Note: Prisma relation for referees needs to be configured
    // For now, store in tournament metadata
    await this.prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        metadata: {
          ...(tournament.metadata as any),
          referees: [
            ...((tournament.metadata as any)?.referees || []),
            refereeId,
          ],
        },
      },
    });

    return {
      success: true,
      message: 'Referee assigned successfully',
    };
  }

  /**
   * Remove referee from tournament (organizer only)
   */
  async removeReferee(
    tournamentId: string,
    refereeId: string,
    organizerId: string,
  ) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    if (tournament.organizerId !== organizerId) {
      throw new ForbiddenException('Only organizer can remove referees');
    }

    const referees = (tournament.metadata as any)?.referees || [];
    const updatedReferees = referees.filter((id: string) => id !== refereeId);

    await this.prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        metadata: {
          ...(tournament.metadata as any),
          referees: updatedReferees,
        },
      },
    });

    return {
      success: true,
      message: 'Referee removed successfully',
    };
  }

  /**
   * Get tournaments assigned to referee
   */
  async getAssignedTournaments(refereeId: string) {
    const tournaments = await this.prisma.tournament.findMany({
      where: {
        status: {
          in: ['REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'IN_PROGRESS'],
        },
      },
      include: {
        organizer: {
          select: { id: true, username: true, avatar: true },
        },
        _count: {
          select: { participants: true, matches: true },
        },
      },
    });

    // Filter tournaments where user is assigned as referee
    const assignedTournaments = tournaments.filter((tournament) => {
      const referees = (tournament.metadata as any)?.referees || [];
      return referees.includes(refereeId);
    });

    return assignedTournaments;
  }

  /**
   * Report match result (referee only)
   */
  async reportMatchResult(dto: ReportMatchResultDto, refereeId: string) {
    const { matchId, homeScore, awayScore, winnerId, notes, matchData } = dto;

    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: { tournament: true },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    // Verify referee is assigned to this tournament
    const referees =
      (match.tournament.metadata as any)?.referees || [];
    if (!referees.includes(refereeId)) {
      throw new ForbiddenException(
        'You are not assigned as referee for this tournament',
      );
    }

    // Update match
    const updated = await this.prisma.match.update({
      where: { id: matchId },
      data: {
        homeScore,
        awayScore,
        winnerId,
        status: MatchStatus.COMPLETED,
        completedAt: new Date(),
        matchData: matchData || match.matchData,
        metadata: {
          ...(match.metadata as any),
          refereeReport: {
            refereeId,
            notes,
            reportedAt: new Date().toISOString(),
          },
        },
      },
    });

    // Update participant wins/losses
    const loserId =
      winnerId === match.homeParticipantId
        ? match.awayParticipantId
        : match.homeParticipantId;

    await Promise.all([
      this.prisma.participant.update({
        where: { id: winnerId },
        data: { wins: { increment: 1 } },
      }),
      loserId
        ? this.prisma.participant.update({
            where: { id: loserId },
            data: { losses: { increment: 1 } },
          })
        : Promise.resolve(),
    ]);

    return {
      success: true,
      match: updated,
      message: 'Match result reported successfully',
    };
  }

  /**
   * Create dispute for match (referee can override)
   */
  async createDispute(matchId: string, reason: string, reportedBy: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    const updated = await this.prisma.match.update({
      where: { id: matchId },
      data: {
        status: MatchStatus.DISPUTED,
        metadata: {
          ...(match.metadata as any),
          dispute: {
            reason,
            reportedBy,
            reportedAt: new Date().toISOString(),
          },
        },
      },
    });

    return {
      success: true,
      match: updated,
      message: 'Dispute created successfully',
    };
  }

  /**
   * Resolve dispute (referee only)
   */
  async resolveDispute(
    matchId: string,
    resolution: 'approve' | 'reject' | 'replay',
    refereeId: string,
    notes?: string,
  ) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: { tournament: true },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    if (match.status !== MatchStatus.DISPUTED) {
      throw new BadRequestException('Match is not disputed');
    }

    // Verify referee
    const referees =
      (match.tournament.metadata as any)?.referees || [];
    if (!referees.includes(refereeId)) {
      throw new ForbiddenException(
        'You are not assigned as referee for this tournament',
      );
    }

    let newStatus = MatchStatus.SCHEDULED;
    if (resolution === 'approve') {
      newStatus = MatchStatus.COMPLETED;
    } else if (resolution === 'replay') {
      newStatus = MatchStatus.SCHEDULED;
    }

    const updated = await this.prisma.match.update({
      where: { id: matchId },
      data: {
        status: newStatus,
        ...(resolution === 'replay' && {
          homeScore: 0,
          awayScore: 0,
          winnerId: null,
        }),
        metadata: {
          ...(match.metadata as any),
          disputeResolution: {
            resolution,
            refereeId,
            notes,
            resolvedAt: new Date().toISOString(),
          },
        },
      },
    });

    return {
      success: true,
      match: updated,
      message: `Dispute ${resolution}ed successfully`,
    };
  }

  /**
   * Get matches needing attention (disputed, pending review)
   */
  async getMatchesNeedingAttention(refereeId: string) {
    const assignedTournaments = await this.getAssignedTournaments(refereeId);
    const tournamentIds = assignedTournaments.map((t) => t.id);

    const matches = await this.prisma.match.findMany({
      where: {
        tournamentId: { in: tournamentIds },
        status: { in: [MatchStatus.DISPUTED, MatchStatus.LIVE] },
      },
      include: {
        tournament: {
          select: { id: true, name: true, game: true },
        },
        homeParticipant: {
          include: { user: true },
        },
        awayParticipant: {
          include: { user: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return matches;
  }
}
