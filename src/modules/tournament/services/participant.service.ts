import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { ParticipantStatus, TournamentStatus } from '@prisma/client';

export interface RegisterParticipantDto {
  tournamentId: string;
  userId: string;
  teamName?: string;
  teamMembers?: any[];
}

export interface CheckInDto {
  participantId: string;
  userId: string;
}

export interface UpdateSeedDto {
  participantId: string;
  seed: number;
}

@Injectable()
export class ParticipantService {
  constructor(private prisma: PrismaService) {}

  /**
   * Register a participant for a tournament
   * - Validates tournament status and capacity
   * - Checks for duplicate registration
   * - Handles entry fee payment (locks balance)
   * - Creates participant record
   */
  async registerParticipant(dto: RegisterParticipantDto) {
    const { tournamentId, userId, teamName, teamMembers } = dto;

    // Fetch tournament
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        participants: true,
      },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    // Validate tournament status
    if (tournament.status !== TournamentStatus.REGISTRATION_OPEN) {
      throw new BadRequestException('Tournament registration is not open');
    }

    // Check capacity
    if (tournament.participants.length >= tournament.maxParticipants) {
      throw new BadRequestException('Tournament is full');
    }

    // Check for duplicate registration
    const existingParticipant = tournament.participants.find(
      (p) => p.userId === userId,
    );
    if (existingParticipant) {
      throw new ConflictException('User already registered for this tournament');
    }

    // Handle entry fee if needed
    const entryFee = Number(tournament.entryFee);
    if (entryFee > 0) {
      await this.handleEntryFeePayment(userId, tournamentId, entryFee);
    }

    // Create participant
    const participant = await this.prisma.participant.create({
      data: {
        tournamentId,
        userId,
        status: ParticipantStatus.REGISTERED,
        teamName,
        teamMembers,
      },
      include: {
        user: {
          select: { id: true, username: true, avatar: true },
        },
        tournament: {
          select: { id: true, name: true, game: true },
        },
      },
    });

    // Update tournament participant count
    await this.prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        currentParticipants: {
          increment: 1,
        },
      },
    });

    return {
      success: true,
      participant,
      message: entryFee > 0
        ? `Successfully registered! Entry fee of $${entryFee} has been locked from your wallet.`
        : 'Successfully registered!',
    };
  }

  /**
   * Handle entry fee payment
   * - Checks wallet balance
   * - Locks the entry fee amount
   * - Creates transaction records
   */
  private async handleEntryFeePayment(
    userId: string,
    tournamentId: string,
    amount: number,
  ) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const availableBalance = Number(wallet.balance);

    if (availableBalance < amount) {
      throw new BadRequestException(
        `Insufficient funds. You need $${amount} but only have $${availableBalance} available.`,
      );
    }

    // Lock the entry fee amount in a transaction
    await this.prisma.$transaction(async (tx) => {
      // Deduct from available balance
      await tx.wallet.update({
        where: { userId },
        data: {
          balance: {
            decrement: amount,
          },
          lockedBalance: {
            increment: amount,
          },
        },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'TOURNAMENT_ENTRY',
          entryType: 'DEBIT',
          amount,
          status: 'PENDING',
          description: `Entry fee locked for tournament`,
          referenceId: tournamentId,
          metadata: {
            action: 'lock_entry_fee',
            tournamentId,
          },
        },
      });
    });
  }

  /**
   * Check-in a participant
   * - Validates participant exists and is registered/confirmed
   * - Updates status to CHECKED_IN
   * - Records check-in timestamp
   */
  async checkInParticipant(dto: CheckInDto) {
    const { participantId, userId } = dto;

    const participant = await this.prisma.participant.findUnique({
      where: { id: participantId },
      include: {
        tournament: true,
      },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    // Verify user owns this participation
    if (participant.userId !== userId) {
      throw new ForbiddenException('You can only check-in yourself');
    }

    // Validate status
    if (
      participant.status !== ParticipantStatus.REGISTERED &&
      participant.status !== ParticipantStatus.CONFIRMED
    ) {
      throw new BadRequestException(
        `Cannot check-in with status: ${participant.status}`,
      );
    }

    // Check tournament status
    if (
      participant.tournament.status === TournamentStatus.COMPLETED ||
      participant.tournament.status === TournamentStatus.CANCELLED
    ) {
      throw new BadRequestException('Tournament is no longer active');
    }

    // Update participant
    const updated = await this.prisma.participant.update({
      where: { id: participantId },
      data: {
        status: ParticipantStatus.CHECKED_IN,
        checkedInAt: new Date(),
      },
      include: {
        user: {
          select: { id: true, username: true, avatar: true },
        },
        tournament: {
          select: { id: true, name: true },
        },
      },
    });

    return {
      success: true,
      participant: updated,
      message: 'Successfully checked in!',
    };
  }

  /**
   * Withdraw a participant from tournament
   * - Validates participant exists
   * - Handles refund logic (based on tournament status)
   * - Updates status to WITHDRAWN
   */
  async withdrawParticipant(participantId: string, userId: string) {
    const participant = await this.prisma.participant.findUnique({
      where: { id: participantId },
      include: {
        tournament: true,
      },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    // Verify user owns this participation
    if (participant.userId !== userId) {
      throw new ForbiddenException('You can only withdraw yourself');
    }

    // Cannot withdraw if already eliminated or disqualified
    if (
      participant.status === ParticipantStatus.ELIMINATED ||
      participant.status === ParticipantStatus.DISQUALIFIED
    ) {
      throw new BadRequestException(
        `Cannot withdraw with status: ${participant.status}`,
      );
    }

    // Check if tournament has started
    const tournamentStarted =
      participant.tournament.status === TournamentStatus.IN_PROGRESS;

    // Handle refund
    const entryFee = Number(participant.tournament.entryFee);
    let refundAmount = 0;

    if (entryFee > 0) {
      // Refund policy: Full refund if tournament hasn't started, no refund if started
      refundAmount = !tournamentStarted ? entryFee : 0;

      if (refundAmount > 0) {
        await this.processRefund(userId, participant.tournamentId, refundAmount);
      }
    }

    // Update participant status
    const updated = await this.prisma.participant.update({
      where: { id: participantId },
      data: {
        status: ParticipantStatus.WITHDRAWN,
      },
      include: {
        user: {
          select: { id: true, username: true, avatar: true },
        },
        tournament: {
          select: { id: true, name: true },
        },
      },
    });

    // Update tournament participant count
    await this.prisma.tournament.update({
      where: { id: participant.tournamentId },
      data: {
        currentParticipants: {
          decrement: 1,
        },
      },
    });

    return {
      success: true,
      participant: updated,
      refunded: refundAmount > 0,
      refundAmount,
      message:
        refundAmount > 0
          ? `Withdrawal successful! $${refundAmount} has been refunded to your wallet.`
          : 'Withdrawal successful!',
    };
  }

  /**
   * Process refund for withdrawn participant
   */
  private async processRefund(
    userId: string,
    tournamentId: string,
    amount: number,
  ) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    await this.prisma.$transaction(async (tx) => {
      // Return locked balance to available balance
      await tx.wallet.update({
        where: { userId },
        data: {
          balance: {
            increment: amount,
          },
          lockedBalance: {
            decrement: amount,
          },
        },
      });

      // Create refund transaction
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'REFUND',
          entryType: 'CREDIT',
          amount,
          status: 'COMPLETED',
          description: `Entry fee refund`,
          referenceId: tournamentId,
          metadata: {
            action: 'refund_entry_fee',
            tournamentId,
          },
        },
      });
    });
  }

  /**
   * Disqualify a participant (organizer/referee only)
   */
  async disqualifyParticipant(
    participantId: string,
    reason: string,
    disqualifiedBy: string,
  ) {
    const participant = await this.prisma.participant.findUnique({
      where: { id: participantId },
      include: {
        tournament: true,
      },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    // Update participant status
    const updated = await this.prisma.participant.update({
      where: { id: participantId },
      data: {
        status: ParticipantStatus.DISQUALIFIED,
        metadata: {
          disqualificationReason: reason,
          disqualifiedBy,
          disqualifiedAt: new Date().toISOString(),
        },
      },
      include: {
        user: {
          select: { id: true, username: true, avatar: true },
        },
        tournament: {
          select: { id: true, name: true },
        },
      },
    });

    // No refund for disqualified participants
    // Entry fee is forfeited

    return {
      success: true,
      participant: updated,
      message: 'Participant disqualified',
    };
  }

  /**
   * Update participant seed (organizer only)
   */
  async updateSeed(dto: UpdateSeedDto) {
    const { participantId, seed } = dto;

    const participant = await this.prisma.participant.findUnique({
      where: { id: participantId },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    // Check for seed conflicts
    const existingSeed = await this.prisma.participant.findFirst({
      where: {
        tournamentId: participant.tournamentId,
        seed,
        id: { not: participantId },
      },
    });

    if (existingSeed) {
      throw new ConflictException(`Seed ${seed} is already taken`);
    }

    const updated = await this.prisma.participant.update({
      where: { id: participantId },
      data: { seed },
      include: {
        user: {
          select: { id: true, username: true, avatar: true },
        },
      },
    });

    return {
      success: true,
      participant: updated,
      message: 'Seed updated successfully',
    };
  }

  /**
   * Get participant stats
   */
  async getParticipantStats(participantId: string) {
    const participant = await this.prisma.participant.findUnique({
      where: { id: participantId },
      include: {
        user: {
          select: { id: true, username: true, avatar: true },
        },
        tournament: {
          select: { id: true, name: true, game: true },
        },
        homeMatches: {
          where: { status: 'COMPLETED' },
        },
        awayMatches: {
          where: { status: 'COMPLETED' },
        },
        gameStats: {
          include: {
            match: {
              select: { id: true, status: true },
            },
          },
        },
      },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    // Calculate stats
    const homeWins = participant.homeMatches.filter(
      (m) => m.winnerId === participantId,
    ).length;
    const awayWins = participant.awayMatches.filter(
      (m) => m.winnerId === participantId,
    ).length;
    const totalWins = homeWins + awayWins;

    const homeLosses = participant.homeMatches.filter(
      (m) => m.winnerId && m.winnerId !== participantId,
    ).length;
    const awayLosses = participant.awayMatches.filter(
      (m) => m.winnerId && m.winnerId !== participantId,
    ).length;
    const totalLosses = homeLosses + awayLosses;

    const totalMatches = totalWins + totalLosses;
    const winRate = totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0;

    // Aggregate game stats
    const aggregatedStats = participant.gameStats.reduce(
      (acc, stat) => {
        Object.entries(stat.stats as Record<string, any>).forEach(
          ([key, value]) => {
            if (typeof value === 'number') {
              acc[key] = (acc[key] || 0) + value;
            }
          },
        );
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      participant: {
        id: participant.id,
        user: participant.user,
        tournament: participant.tournament,
        status: participant.status,
        seed: participant.seed,
        finalRank: participant.finalRank,
      },
      stats: {
        wins: totalWins,
        losses: totalLosses,
        totalMatches,
        winRate,
        aggregatedStats,
      },
    };
  }

  /**
   * Auto-seed participants (organizer only)
   * Seeds participants randomly or by a custom algorithm
   */
  async autoSeedParticipants(
    tournamentId: string,
    method: 'random' | 'skill' = 'random',
  ) {
    const participants = await this.prisma.participant.findMany({
      where: {
        tournamentId,
        status: {
          in: [
            ParticipantStatus.REGISTERED,
            ParticipantStatus.CONFIRMED,
            ParticipantStatus.CHECKED_IN,
          ],
        },
      },
      include: {
        user: true,
      },
    });

    if (participants.length === 0) {
      throw new BadRequestException('No participants to seed');
    }

    // Random seeding
    let seededParticipants = [...participants];

    if (method === 'random') {
      // Fisher-Yates shuffle
      for (let i = seededParticipants.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [seededParticipants[i], seededParticipants[j]] = [
          seededParticipants[j],
          seededParticipants[i],
        ];
      }
    } else if (method === 'skill') {
      // TODO: Implement skill-based seeding
      // For now, sort by user's total wins (if we had global stats)
      seededParticipants.sort(() => Math.random() - 0.5);
    }

    // Update seeds in database
    const updates = seededParticipants.map((participant, index) =>
      this.prisma.participant.update({
        where: { id: participant.id },
        data: { seed: index + 1 },
      }),
    );

    await this.prisma.$transaction(updates);

    return {
      success: true,
      message: `Successfully seeded ${participants.length} participants using ${method} method`,
      count: participants.length,
    };
  }
}
