import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { TournamentService } from './tournament.service';
import { PrismaService } from '../prisma/prisma.service';
import { TournamentType, TournamentStatus, TournamentVisibility } from '@prisma/client';

describe('TournamentService', () => {
  let service: TournamentService;
  let prisma: PrismaService;

  const mockPrismaService = {
    tournament: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    participant: {
      findMany: jest.fn(),
    },
    match: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockTournament = {
    id: '1',
    name: 'Test Tournament',
    description: 'Test Description',
    game: 'League of Legends',
    type: TournamentType.SINGLE_ELIMINATION,
    status: TournamentStatus.UPCOMING,
    visibility: TournamentVisibility.PUBLIC,
    maxParticipants: 16,
    organizerId: 'user1',
    registrationStart: new Date(),
    registrationEnd: new Date(),
    startDate: new Date(),
    endDate: null,
    prizePool: 1000,
    entryFee: 10,
    rules: 'Standard rules',
    format: '5v5',
    region: 'NA',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TournamentService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TournamentService>(TournamentService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated tournaments', async () => {
      const filters = { page: 1, limit: 20 };
      mockPrismaService.tournament.findMany.mockResolvedValue([mockTournament]);
      mockPrismaService.tournament.count.mockResolvedValue(1);

      const result = await service.findAll(filters);

      expect(result).toEqual({
        data: [mockTournament],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
    });

    it('should filter tournaments by game', async () => {
      const filters = { game: 'League of Legends', page: 1, limit: 20 };
      mockPrismaService.tournament.findMany.mockResolvedValue([mockTournament]);
      mockPrismaService.tournament.count.mockResolvedValue(1);

      await service.findAll(filters);

      expect(mockPrismaService.tournament.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ game: 'League of Legends' }),
        }),
      );
    });

    it('should search tournaments by name', async () => {
      const filters = { search: 'Test', page: 1, limit: 20 };
      mockPrismaService.tournament.findMany.mockResolvedValue([mockTournament]);
      mockPrismaService.tournament.count.mockResolvedValue(1);

      await service.findAll(filters);

      expect(mockPrismaService.tournament.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a tournament by id', async () => {
      mockPrismaService.tournament.findUnique.mockResolvedValue(mockTournament);

      const result = await service.findOne('1');

      expect(result).toEqual(mockTournament);
      expect(mockPrismaService.tournament.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if tournament not found', async () => {
      mockPrismaService.tournament.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createDto = {
      name: 'New Tournament',
      description: 'New Description',
      game: 'Valorant',
      type: TournamentType.SINGLE_ELIMINATION,
      maxParticipants: 32,
      registrationStart: new Date().toISOString(),
      registrationEnd: new Date().toISOString(),
      startDate: new Date().toISOString(),
      prizePool: 5000,
      entryFee: 25,
      rules: 'Tournament rules',
    };

    it('should create a new tournament', async () => {
      mockPrismaService.tournament.create.mockResolvedValue(mockTournament);

      const result = await service.create(createDto, 'user1');

      expect(result).toEqual(mockTournament);
      expect(mockPrismaService.tournament.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: createDto.name,
            organizerId: 'user1',
          }),
        }),
      );
    });
  });

  describe('update', () => {
    const updateDto = {
      name: 'Updated Tournament',
      status: TournamentStatus.ONGOING,
    };

    it('should update a tournament if user is organizer', async () => {
      mockPrismaService.tournament.findUnique.mockResolvedValue(mockTournament);
      mockPrismaService.tournament.update.mockResolvedValue({
        ...mockTournament,
        ...updateDto,
      });

      const result = await service.update('1', updateDto, 'user1');

      expect(result.name).toBe('Updated Tournament');
      expect(mockPrismaService.tournament.update).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user is not organizer', async () => {
      mockPrismaService.tournament.findUnique.mockResolvedValue(mockTournament);

      await expect(service.update('1', updateDto, 'user2')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw NotFoundException if tournament not found', async () => {
      mockPrismaService.tournament.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent', updateDto, 'user1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a tournament if user is organizer', async () => {
      mockPrismaService.tournament.findUnique.mockResolvedValue(mockTournament);
      mockPrismaService.tournament.delete.mockResolvedValue(mockTournament);

      await service.delete('1', 'user1');

      expect(mockPrismaService.tournament.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw UnauthorizedException if user is not organizer', async () => {
      mockPrismaService.tournament.findUnique.mockResolvedValue(mockTournament);

      await expect(service.delete('1', 'user2')).rejects.toThrow(UnauthorizedException);
    });
  });
});
