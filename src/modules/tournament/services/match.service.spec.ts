import { Test, TestingModule } from '@nestjs/testing';
import { MatchService } from './match.service';
import { PrismaService } from '@/common/prisma/prisma.service';
import { RealtimeGateway } from '@/modules/realtime/realtime.gateway';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('MatchService', () => {
  let service: MatchService;
  let prisma: PrismaService;
  let realtimeGateway: RealtimeGateway;

  const mockPrismaService = {
    tournament: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    participant: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    match: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockRealtimeGateway = {
    broadcastMatchUpdate: jest.fn(),
    broadcastMatchStart: jest.fn(),
    broadcastMatchComplete: jest.fn(),
  };

  const mockTournament = {
    id: 'tournament-1',
    name: 'Test Tournament',
    type: 'SINGLE_ELIMINATION',
    status: 'REGISTRATION_CLOSED',
    maxParticipants: 8,
  };

  const mockParticipants = [
    { id: 'p1', userId: 'user-1', seed: 1, status: 'CHECKED_IN' },
    { id: 'p2', userId: 'user-2', seed: 2, status: 'CHECKED_IN' },
    { id: 'p3', userId: 'user-3', seed: 3, status: 'CHECKED_IN' },
    { id: 'p4', userId: 'user-4', seed: 4, status: 'CHECKED_IN' },
    { id: 'p5', userId: 'user-5', seed: 5, status: 'CHECKED_IN' },
    { id: 'p6', userId: 'user-6', seed: 6, status: 'CHECKED_IN' },
    { id: 'p7', userId: 'user-7', seed: 7, status: 'CHECKED_IN' },
    { id: 'p8', userId: 'user-8', seed: 8, status: 'CHECKED_IN' },
  ];

  const mockMatch = {
    id: 'match-1',
    tournamentId: 'tournament-1',
    round: 1,
    matchNumber: 1,
    status: 'SCHEDULED',
    homeParticipantId: 'p1',
    awayParticipantId: 'p8',
    homeScore: 0,
    awayScore: 0,
    bestOf: 3,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RealtimeGateway, useValue: mockRealtimeGateway },
      ],
    }).compile();

    service = module.get<MatchService>(MatchService);
    prisma = module.get<PrismaService>(PrismaService);
    realtimeGateway = module.get<RealtimeGateway>(RealtimeGateway);

    jest.clearAllMocks();
  });

  describe('generateBracket', () => {
    it('should generate single elimination bracket for power of 2 participants', async () => {
      mockPrismaService.tournament.findUnique.mockResolvedValue(mockTournament);
      mockPrismaService.participant.findMany.mockResolvedValue(mockParticipants);
      mockPrismaService.match.count.mockResolvedValue(0);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });
      mockPrismaService.match.create.mockResolvedValue(mockMatch);

      const result = await service.generateBracket('tournament-1');

      expect(result.success).toBe(true);
      expect(result.matchesCreated).toBeGreaterThan(0);
      // For 8 participants in single elimination: Round 1 (4 matches) + Round 2 (2 matches) + Final (1 match) = 7 matches
      expect(mockPrismaService.match.create).toHaveBeenCalled();
    });

    it('should throw error if tournament not found', async () => {
      mockPrismaService.tournament.findUnique.mockResolvedValue(null);

      await expect(service.generateBracket('invalid-id')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw error if bracket already generated', async () => {
      mockPrismaService.tournament.findUnique.mockResolvedValue(mockTournament);
      mockPrismaService.match.count.mockResolvedValue(5); // Matches exist

      await expect(service.generateBracket('tournament-1')).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw error if no participants', async () => {
      mockPrismaService.tournament.findUnique.mockResolvedValue(mockTournament);
      mockPrismaService.match.count.mockResolvedValue(0);
      mockPrismaService.participant.findMany.mockResolvedValue([]);

      await expect(service.generateBracket('tournament-1')).rejects.toThrow(
        BadRequestException
      );
    });

    it('should handle non-power-of-2 participants with byes', async () => {
      const sixParticipants = mockParticipants.slice(0, 6);

      mockPrismaService.tournament.findUnique.mockResolvedValue(mockTournament);
      mockPrismaService.participant.findMany.mockResolvedValue(sixParticipants);
      mockPrismaService.match.count.mockResolvedValue(0);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });
      mockPrismaService.match.create.mockResolvedValue(mockMatch);

      const result = await service.generateBracket('tournament-1');

      expect(result.success).toBe(true);
      // Should create byes for top-seeded players
      expect(mockPrismaService.match.create).toHaveBeenCalled();
    });
  });

  describe('generateSingleEliminationBracket', () => {
    it('should create proper bracket pairings (1v8, 2v7, 3v6, 4v5)', async () => {
      const tournament = {
        ...mockTournament,
        participants: mockParticipants,
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });

      const createdMatches = [];
      mockPrismaService.match.create.mockImplementation((args) => {
        createdMatches.push(args.data);
        return Promise.resolve({ ...mockMatch, ...args.data });
      });

      await service.generateSingleEliminationBracket(tournament);

      // Verify first round pairings
      const round1Matches = createdMatches.filter((m) => m.round === 1);
      expect(round1Matches).toHaveLength(4);

      // Check seeding logic: 1v8, 2v7, 3v6, 4v5
      const match1 = round1Matches.find((m) => m.matchNumber === 1);
      expect(match1.homeParticipantId).toBe('p1'); // Seed 1
      expect(match1.awayParticipantId).toBe('p8'); // Seed 8
    });

    it('should create subsequent rounds correctly', async () => {
      const tournament = {
        ...mockTournament,
        participants: mockParticipants,
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });

      const createdMatches = [];
      mockPrismaService.match.create.mockImplementation((args) => {
        createdMatches.push(args.data);
        return Promise.resolve({ ...mockMatch, ...args.data });
      });

      await service.generateSingleEliminationBracket(tournament);

      // Verify round structure
      const rounds = [...new Set(createdMatches.map((m) => m.round))];
      expect(rounds).toContain(1); // Quarter-finals
      expect(rounds).toContain(2); // Semi-finals
      expect(rounds).toContain(3); // Finals
    });
  });

  describe('generateRoundRobinBracket', () => {
    it('should create matches where everyone plays everyone', async () => {
      const fourParticipants = mockParticipants.slice(0, 4);
      const tournament = {
        ...mockTournament,
        type: 'ROUND_ROBIN',
        participants: fourParticipants,
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });

      const createdMatches = [];
      mockPrismaService.match.create.mockImplementation((args) => {
        createdMatches.push(args.data);
        return Promise.resolve({ ...mockMatch, ...args.data });
      });

      await service.generateRoundRobinBracket(tournament);

      // For 4 participants: 4 * 3 / 2 = 6 matches
      expect(createdMatches).toHaveLength(6);

      // Verify no participant plays themselves
      createdMatches.forEach((match) => {
        expect(match.homeParticipantId).not.toBe(match.awayParticipantId);
      });

      // Verify all unique pairings
      const pairings = createdMatches.map((m) =>
        [m.homeParticipantId, m.awayParticipantId].sort().join('-')
      );
      const uniquePairings = new Set(pairings);
      expect(uniquePairings.size).toBe(6);
    });
  });

  describe('updateMatchScore', () => {
    it('should update match score and determine winner', async () => {
      const dto = {
        matchId: 'match-1',
        homeScore: 2,
        awayScore: 1,
        winnerId: 'p1',
      };

      mockPrismaService.match.findUnique.mockResolvedValue({
        ...mockMatch,
        tournament: mockTournament,
      });

      mockPrismaService.match.update.mockResolvedValue({
        ...mockMatch,
        homeScore: 2,
        awayScore: 1,
        winnerId: 'p1',
        status: 'COMPLETED',
      });

      mockPrismaService.participant.update.mockResolvedValue({
        id: 'p1',
        wins: 1,
      });

      const result = await service.updateMatchScore(dto);

      expect(result.homeScore).toBe(2);
      expect(result.awayScore).toBe(1);
      expect(result.winnerId).toBe('p1');
      expect(result.status).toBe('COMPLETED');

      // Verify participant stats updated
      expect(mockPrismaService.participant.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { wins: { increment: 1 } },
      });

      expect(mockRealtimeGateway.broadcastMatchComplete).toHaveBeenCalledWith(
        'match-1',
        expect.any(Object)
      );
    });

    it('should throw error if match not found', async () => {
      mockPrismaService.match.findUnique.mockResolvedValue(null);

      await expect(
        service.updateMatchScore({
          matchId: 'invalid-id',
          homeScore: 2,
          awayScore: 1,
        })
      ).rejects.toThrow(NotFoundException);
    });

    it('should validate scores are non-negative', async () => {
      mockPrismaService.match.findUnique.mockResolvedValue({
        ...mockMatch,
        tournament: mockTournament,
      });

      await expect(
        service.updateMatchScore({
          matchId: 'match-1',
          homeScore: -1,
          awayScore: 2,
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('advanceWinnerToNextRound', () => {
    it('should advance winner to next match in bracket', async () => {
      const currentMatch = {
        ...mockMatch,
        round: 1,
        matchNumber: 1,
        winnerId: 'p1',
      };

      const nextMatch = {
        id: 'match-5',
        round: 2,
        matchNumber: 1,
        homeParticipantId: null,
      };

      mockPrismaService.match.findMany.mockResolvedValue([nextMatch]);
      mockPrismaService.match.update.mockResolvedValue({
        ...nextMatch,
        homeParticipantId: 'p1',
      });

      await service.advanceWinnerToNextRound(currentMatch, 'p1');

      expect(mockPrismaService.match.update).toHaveBeenCalledWith({
        where: { id: 'match-5' },
        data: { homeParticipantId: 'p1' },
      });
    });

    it('should handle final match (no next round)', async () => {
      const finalMatch = {
        ...mockMatch,
        round: 3,
        matchNumber: 1,
        winnerId: 'p1',
      };

      mockPrismaService.match.findMany.mockResolvedValue([]);
      mockPrismaService.participant.update.mockResolvedValue({
        id: 'p1',
        finalRank: 1,
      });

      await service.advanceWinnerToNextRound(finalMatch, 'p1');

      // Winner should be marked with final rank
      expect(mockPrismaService.participant.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { finalRank: 1 },
      });
    });
  });

  describe('startMatch', () => {
    it('should start a match and broadcast to viewers', async () => {
      mockPrismaService.match.findUnique.mockResolvedValue(mockMatch);
      mockPrismaService.match.update.mockResolvedValue({
        ...mockMatch,
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      });

      const result = await service.startMatch('match-1');

      expect(result.status).toBe('IN_PROGRESS');
      expect(result.startedAt).toBeDefined();
      expect(mockRealtimeGateway.broadcastMatchStart).toHaveBeenCalledWith(
        'match-1',
        expect.any(Object)
      );
    });

    it('should throw error if match already started', async () => {
      mockPrismaService.match.findUnique.mockResolvedValue({
        ...mockMatch,
        status: 'IN_PROGRESS',
      });

      await expect(service.startMatch('match-1')).rejects.toThrow(
        BadRequestException
      );
    });
  });
});
