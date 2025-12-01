import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateTournamentDto, UpdateTournamentDto, TournamentFiltersDto, UpdateMatchDto } from './dto/tournament.dto';

@Injectable()
export class TournamentService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: TournamentFiltersDto) {
    const { game, type, status, visibility, search, page = 1, limit = 20 } = filters;
    
    const where: any = {};
    
    if (game) where.game = game;
    if (type) where.type = type;
    if (status) where.status = status;
    if (visibility) where.visibility = visibility;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.tournament.findMany({
        where,
        include: {
          organizer: {
            select: { id: true, username: true, avatar: true },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tournament.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id },
      include: {
        organizer: {
          select: { id: true, username: true, avatar: true },
        },
      },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    return tournament;
  }

  async create(createDto: CreateTournamentDto, userId: string) {
    return this.prisma.tournament.create({
      data: {
        ...createDto,
        organizerId: userId,
        entryFee: createDto.entryFee || 0,
        prizePool: createDto.prizePool || 0,
        visibility: createDto.visibility || 'PUBLIC',
      },
    });
  }

  async update(id: string, updateDto: UpdateTournamentDto, userId: string) {
    const tournament = await this.findOne(id);

    if (tournament.organizerId !== userId) {
      throw new ForbiddenException('You can only update your own tournaments');
    }

    return this.prisma.tournament.update({
      where: { id },
      data: updateDto,
    });
  }

  async delete(id: string, userId: string) {
    const tournament = await this.findOne(id);

    if (tournament.organizerId !== userId) {
      throw new ForbiddenException('You can only delete your own tournaments');
    }

    await this.prisma.tournament.delete({ where: { id } });
    
    return { message: 'Tournament deleted successfully' };
  }

  async getParticipants(id: string) {
    await this.findOne(id);

    return this.prisma.participant.findMany({
      where: { tournamentId: id },
      include: {
        user: {
          select: { id: true, username: true, avatar: true },
        },
      },
      orderBy: { seed: 'asc' },
    });
  }

  async getBracket(id: string) {
    await this.findOne(id);

    const matches = await this.prisma.match.findMany({
      where: { tournamentId: id },
      include: {
        homeParticipant: {
          include: {
            user: { select: { id: true, username: true, avatar: true } },
          },
        },
        awayParticipant: {
          include: {
            user: { select: { id: true, username: true, avatar: true } },
          },
        },
      },
      orderBy: [{ round: 'asc' }, { matchNumber: 'asc' }],
    });

    // Transform to bracket format
    return {
      winnersBracket: [],
      losersBracket: [],
      grandFinal: null,
      connections: [],
      dimensions: { width: 1200, height: 800 },
    };
  }

  async getTournamentMatches(id: string) {
    await this.findOne(id);

    return this.prisma.match.findMany({
      where: { tournamentId: id },
      include: {
        homeParticipant: {
          include: {
            user: { select: { id: true, username: true, avatar: true } },
          },
        },
        awayParticipant: {
          include: {
            user: { select: { id: true, username: true, avatar: true } },
          },
        },
      },
      orderBy: [{ round: 'asc' }, { matchNumber: 'asc' }],
    });
  }

  async updateMatch(matchId: string, updateDto: UpdateMatchDto) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    return this.prisma.match.update({
      where: { id: matchId },
      data: updateDto as any,
    });
  }
}
