import { Test, TestingModule } from '@nestjs/testing';
import { ParticipantService } from './participant.service';
import { PrismaService } from '@/common/prisma/prisma.service';
import { TransactionService } from '@/modules/billing/services/transaction.service';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';

describe('ParticipantService', () => {
  let service: ParticipantService;
  let prisma: PrismaService;
  let transactionService: TransactionService;

  const mockPrismaService = {
    participant: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    tournament: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    wallet: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockTransactionService = {
    createDoubleEntryTransaction: jest.fn(),
  };

  const mockTournament = {
    id: 'tournament-1',
    name: 'Test Tournament',
    status: 'REGISTRATION_OPEN',
    maxParticipants: 16,
    entryFee: 50,
    organizerId: 'organizer-1',
    type: 'SINGLE_ELIMINATION',
  };

  const mockUser = {
    id: 'user-1',
    username: 'TestPlayer',
  };

  const mockWallet = {
    id: 'wallet-1',
    userId: 'user-1',
    balance: 100,
    lockedBalance: 0,
  };

  const mockParticipant = {
    id: 'participant-1',
    tournamentId: 'tournament-1',
    userId: 'user-1',
    status: 'REGISTERED',
    seed: 1,
    wins: 0,
    losses: 0,
    teamName: null,
    teamMembers: null,
    user: mockUser,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParticipantService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: TransactionService, useValue: mockTransactionService },
      ],
    }).compile();

    service = module.get<ParticipantService>(ParticipantService);
    prisma = module.get<PrismaService>(PrismaService);
    transactionService = module.get<TransactionService>(TransactionService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('registerParticipant', () => {
    it('should successfully register a participant with entry fee', async () => {
      const dto = {
        tournamentId: 'tournament-1',
        userId: 'user-1',
      };

      mockPrismaService.tournament.findUnique.mockResolvedValue(mockTournament);
      mockPrismaService.participant.findUnique.mockResolvedValue(null);
      mockPrismaService.participant.count.mockResolvedValue(10);
      mockPrismaService.wallet.findUnique.mockResolvedValue(mockWallet);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });
      mockPrismaService.participant.create.mockResolvedValue(mockParticipant);

      const result = await service.registerParticipant(dto);

      expect(result).toEqual(mockParticipant);
      expect(mockPrismaService.tournament.findUnique).toHaveBeenCalledWith({
        where: { id: dto.tournamentId },
      });
      expect(mockPrismaService.wallet.update).toHaveBeenCalled();
    });

    it('should throw error if tournament not found', async () => {
      mockPrismaService.tournament.findUnique.mockResolvedValue(null);

      await expect(
        service.registerParticipant({
          tournamentId: 'invalid-id',
          userId: 'user-1',
        })
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error if tournament is full', async () => {
      mockPrismaService.tournament.findUnique.mockResolvedValue(mockTournament);
      mockPrismaService.participant.findUnique.mockResolvedValue(null);
      mockPrismaService.participant.count.mockResolvedValue(16); // Full

      await expect(
        service.registerParticipant({
          tournamentId: 'tournament-1',
          userId: 'user-1',
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error if already registered', async () => {
      mockPrismaService.tournament.findUnique.mockResolvedValue(mockTournament);
      mockPrismaService.participant.findUnique.mockResolvedValue(mockParticipant);

      await expect(
        service.registerParticipant({
          tournamentId: 'tournament-1',
          userId: 'user-1',
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error if insufficient balance for entry fee', async () => {
      mockPrismaService.tournament.findUnique.mockResolvedValue(mockTournament);
      mockPrismaService.participant.findUnique.mockResolvedValue(null);
      mockPrismaService.participant.count.mockResolvedValue(10);
      mockPrismaService.wallet.findUnique.mockResolvedValue({
        ...mockWallet,
        balance: 30, // Less than entry fee of 50
      });

      await expect(
        service.registerParticipant({
          tournamentId: 'tournament-1',
          userId: 'user-1',
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('checkInParticipant', () => {
    it('should successfully check-in a participant', async () => {
      mockPrismaService.participant.findUnique.mockResolvedValue(mockParticipant);
      mockPrismaService.participant.update.mockResolvedValue({
        ...mockParticipant,
        status: 'CHECKED_IN',
        checkedInAt: new Date(),
      });

      const result = await service.checkInParticipant({
        participantId: 'participant-1',
        userId: 'user-1',
      });

      expect(result.status).toBe('CHECKED_IN');
      expect(mockPrismaService.participant.update).toHaveBeenCalledWith({
        where: { id: 'participant-1' },
        data: {
          status: 'CHECKED_IN',
          checkedInAt: expect.any(Date),
        },
        include: { user: true },
      });
    });

    it('should throw error if participant not found', async () => {
      mockPrismaService.participant.findUnique.mockResolvedValue(null);

      await expect(
        service.checkInParticipant({
          participantId: 'invalid-id',
          userId: 'user-1',
        })
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error if not the participant owner', async () => {
      mockPrismaService.participant.findUnique.mockResolvedValue(mockParticipant);

      await expect(
        service.checkInParticipant({
          participantId: 'participant-1',
          userId: 'different-user',
        })
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('withdrawParticipant', () => {
    it('should successfully withdraw with full refund before tournament starts', async () => {
      const tournamentNotStarted = { ...mockTournament, status: 'REGISTRATION_OPEN' };

      mockPrismaService.participant.findUnique.mockResolvedValue({
        ...mockParticipant,
        tournament: tournamentNotStarted,
      });
      mockPrismaService.wallet.findUnique.mockResolvedValue(mockWallet);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });
      mockPrismaService.participant.update.mockResolvedValue({
        ...mockParticipant,
        status: 'WITHDRAWN',
      });

      const result = await service.withdrawParticipant('participant-1', 'user-1');

      expect(result.status).toBe('WITHDRAWN');
      expect(mockPrismaService.wallet.update).toHaveBeenCalled(); // Refund issued
    });

    it('should throw error if participant not found', async () => {
      mockPrismaService.participant.findUnique.mockResolvedValue(null);

      await expect(
        service.withdrawParticipant('invalid-id', 'user-1')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('disqualifyParticipant', () => {
    it('should successfully disqualify a participant', async () => {
      mockPrismaService.participant.findUnique.mockResolvedValue({
        ...mockParticipant,
        tournament: mockTournament,
      });
      mockPrismaService.participant.update.mockResolvedValue({
        ...mockParticipant,
        status: 'DISQUALIFIED',
      });

      const result = await service.disqualifyParticipant(
        'participant-1',
        'Cheating',
        'organizer-1'
      );

      expect(result.status).toBe('DISQUALIFIED');
      expect(mockPrismaService.participant.update).toHaveBeenCalledWith({
        where: { id: 'participant-1' },
        data: {
          status: 'DISQUALIFIED',
          metadata: expect.objectContaining({
            disqualificationReason: 'Cheating',
          }),
        },
        include: { user: true },
      });
    });

    it('should throw error if not organizer', async () => {
      mockPrismaService.participant.findUnique.mockResolvedValue({
        ...mockParticipant,
        tournament: mockTournament,
      });

      await expect(
        service.disqualifyParticipant('participant-1', 'Cheating', 'random-user')
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateSeed', () => {
    it('should successfully update participant seed', async () => {
      mockPrismaService.participant.findUnique.mockResolvedValue(mockParticipant);
      mockPrismaService.participant.update.mockResolvedValue({
        ...mockParticipant,
        seed: 5,
      });

      const result = await service.updateSeed({
        participantId: 'participant-1',
        seed: 5,
      });

      expect(result.seed).toBe(5);
      expect(mockPrismaService.participant.update).toHaveBeenCalledWith({
        where: { id: 'participant-1' },
        data: { seed: 5 },
        include: { user: true },
      });
    });

    it('should throw error if seed is invalid', async () => {
      mockPrismaService.participant.findUnique.mockResolvedValue(mockParticipant);

      await expect(
        service.updateSeed({
          participantId: 'participant-1',
          seed: 0, // Invalid
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('autoSeedParticipants', () => {
    it('should auto-seed participants randomly', async () => {
      const participants = [
        { ...mockParticipant, id: 'p1' },
        { ...mockParticipant, id: 'p2' },
        { ...mockParticipant, id: 'p3' },
      ];

      mockPrismaService.tournament.findUnique.mockResolvedValue(mockTournament);
      mockPrismaService.participant.findMany.mockResolvedValue(participants);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });

      const result = await service.autoSeedParticipants('tournament-1', 'random');

      expect(result.success).toBe(true);
      expect(result.count).toBe(3);
      expect(mockPrismaService.participant.update).toHaveBeenCalledTimes(3);
    });
  });

  describe('getParticipantStats', () => {
    it('should return participant statistics', async () => {
      const participantWithMatches = {
        ...mockParticipant,
        wins: 5,
        losses: 3,
        homeMatches: [{ status: 'COMPLETED', winnerId: 'user-1' }],
        awayMatches: [{ status: 'COMPLETED', winnerId: 'other-user' }],
      };

      mockPrismaService.participant.findUnique.mockResolvedValue(participantWithMatches);

      const result = await service.getParticipantStats('participant-1');

      expect(result).toEqual({
        participant: expect.objectContaining({
          id: 'participant-1',
          wins: 5,
          losses: 3,
        }),
        stats: expect.objectContaining({
          totalMatches: 8,
          wins: 5,
          losses: 3,
          winRate: expect.any(Number),
        }),
      });
    });
  });
});
