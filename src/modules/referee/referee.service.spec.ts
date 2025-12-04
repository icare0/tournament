import { Test, TestingModule } from '@nestjs/testing';
import { RefereeService } from './referee.service';
import { PrismaService } from '@/common/prisma/prisma.service';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';

describe('RefereeService', () => {
  let service: RefereeService;
  let prisma: PrismaService;

  const mockPrismaService = {
    tournament: {
      findUnique: jest.fn(),
    },
    referee: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    match: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockTournament = {
    id: 'tournament-1',
    name: 'Test Tournament',
    organizerId: 'organizer-1',
    status: 'IN_PROGRESS',
  };

  const mockReferee = {
    id: 'referee-1',
    tournamentId: 'tournament-1',
    userId: 'referee-user-1',
    assignedBy: 'organizer-1',
    permissions: ['REPORT_RESULTS', 'RESOLVE_DISPUTES'],
    createdAt: new Date(),
  };

  const mockMatch = {
    id: 'match-1',
    tournamentId: 'tournament-1',
    round: 1,
    matchNumber: 1,
    status: 'IN_PROGRESS',
    homeParticipantId: 'p1',
    awayParticipantId: 'p2',
    homeScore: 0,
    awayScore: 0,
  };

  const mockUser = {
    id: 'referee-user-1',
    username: 'RefereeName',
    role: 'REFEREE',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefereeService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<RefereeService>(RefereeService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('assignReferee', () => {
    it('should successfully assign a referee to a tournament', async () => {
      const dto = {
        tournamentId: 'tournament-1',
        refereeUserId: 'referee-user-1',
        permissions: ['REPORT_RESULTS', 'RESOLVE_DISPUTES'],
      };

      mockPrismaService.tournament.findUnique.mockResolvedValue(mockTournament);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.referee.findUnique.mockResolvedValue(null); // Not already assigned
      mockPrismaService.referee.create.mockResolvedValue(mockReferee);

      const result = await service.assignReferee(dto, 'organizer-1');

      expect(result).toEqual(mockReferee);
      expect(mockPrismaService.referee.create).toHaveBeenCalledWith({
        data: {
          tournamentId: dto.tournamentId,
          userId: dto.refereeUserId,
          assignedBy: 'organizer-1',
          permissions: dto.permissions,
        },
        include: {
          user: true,
          tournament: true,
        },
      });
    });

    it('should throw error if tournament not found', async () => {
      mockPrismaService.tournament.findUnique.mockResolvedValue(null);

      await expect(
        service.assignReferee(
          {
            tournamentId: 'invalid-id',
            refereeUserId: 'referee-user-1',
            permissions: [],
          },
          'organizer-1'
        )
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error if not the organizer', async () => {
      mockPrismaService.tournament.findUnique.mockResolvedValue(mockTournament);

      await expect(
        service.assignReferee(
          {
            tournamentId: 'tournament-1',
            refereeUserId: 'referee-user-1',
            permissions: [],
          },
          'random-user'
        )
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw error if referee user not found', async () => {
      mockPrismaService.tournament.findUnique.mockResolvedValue(mockTournament);
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.assignReferee(
          {
            tournamentId: 'tournament-1',
            refereeUserId: 'invalid-user',
            permissions: [],
          },
          'organizer-1'
        )
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error if referee already assigned', async () => {
      mockPrismaService.tournament.findUnique.mockResolvedValue(mockTournament);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.referee.findUnique.mockResolvedValue(mockReferee);

      await expect(
        service.assignReferee(
          {
            tournamentId: 'tournament-1',
            refereeUserId: 'referee-user-1',
            permissions: [],
          },
          'organizer-1'
        )
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeReferee', () => {
    it('should successfully remove a referee from tournament', async () => {
      mockPrismaService.tournament.findUnique.mockResolvedValue(mockTournament);
      mockPrismaService.referee.findUnique.mockResolvedValue(mockReferee);
      mockPrismaService.referee.delete.mockResolvedValue(mockReferee);

      const result = await service.removeReferee(
        'tournament-1',
        'referee-user-1',
        'organizer-1'
      );

      expect(result).toEqual({
        success: true,
        message: expect.any(String),
      });

      expect(mockPrismaService.referee.delete).toHaveBeenCalledWith({
        where: {
          tournamentId_userId: {
            tournamentId: 'tournament-1',
            userId: 'referee-user-1',
          },
        },
      });
    });

    it('should throw error if not the organizer', async () => {
      mockPrismaService.tournament.findUnique.mockResolvedValue(mockTournament);

      await expect(
        service.removeReferee('tournament-1', 'referee-user-1', 'random-user')
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw error if referee not assigned', async () => {
      mockPrismaService.tournament.findUnique.mockResolvedValue(mockTournament);
      mockPrismaService.referee.findUnique.mockResolvedValue(null);

      await expect(
        service.removeReferee('tournament-1', 'referee-user-1', 'organizer-1')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAssignedTournaments', () => {
    it('should return list of tournaments assigned to referee', async () => {
      const assignedTournaments = [
        { ...mockReferee, tournament: mockTournament },
      ];

      mockPrismaService.referee.findMany.mockResolvedValue(assignedTournaments);

      const result = await service.getAssignedTournaments('referee-user-1');

      expect(result).toHaveLength(1);
      expect(result[0].tournament).toEqual(mockTournament);
      expect(mockPrismaService.referee.findMany).toHaveBeenCalledWith({
        where: { userId: 'referee-user-1' },
        include: {
          tournament: true,
          user: true,
        },
      });
    });
  });

  describe('reportMatchResult', () => {
    it('should successfully report match result as referee', async () => {
      const dto = {
        matchId: 'match-1',
        homeScore: 2,
        awayScore: 1,
        winnerId: 'p1',
        notes: 'Clean match',
      };

      mockPrismaService.match.findUnique.mockResolvedValue({
        ...mockMatch,
        tournament: mockTournament,
      });

      mockPrismaService.referee.findUnique.mockResolvedValue(mockReferee);

      mockPrismaService.match.update.mockResolvedValue({
        ...mockMatch,
        homeScore: 2,
        awayScore: 1,
        winnerId: 'p1',
        status: 'COMPLETED',
      });

      const result = await service.reportMatchResult(dto, 'referee-user-1');

      expect(result.homeScore).toBe(2);
      expect(result.awayScore).toBe(1);
      expect(result.status).toBe('COMPLETED');

      expect(mockPrismaService.match.update).toHaveBeenCalledWith({
        where: { id: 'match-1' },
        data: {
          homeScore: 2,
          awayScore: 1,
          winnerId: 'p1',
          status: 'COMPLETED',
          completedAt: expect.any(Date),
          metadata: expect.objectContaining({
            reportedBy: 'referee-user-1',
            refereeNotes: 'Clean match',
          }),
        },
        include: expect.any(Object),
      });
    });

    it('should throw error if match not found', async () => {
      mockPrismaService.match.findUnique.mockResolvedValue(null);

      await expect(
        service.reportMatchResult(
          {
            matchId: 'invalid-id',
            homeScore: 2,
            awayScore: 1,
          },
          'referee-user-1'
        )
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error if not assigned as referee', async () => {
      mockPrismaService.match.findUnique.mockResolvedValue({
        ...mockMatch,
        tournament: mockTournament,
      });
      mockPrismaService.referee.findUnique.mockResolvedValue(null);

      await expect(
        service.reportMatchResult(
          {
            matchId: 'match-1',
            homeScore: 2,
            awayScore: 1,
          },
          'random-user'
        )
      ).rejects.toThrow(ForbiddenException);
    });

    it('should validate scores are non-negative', async () => {
      mockPrismaService.match.findUnique.mockResolvedValue({
        ...mockMatch,
        tournament: mockTournament,
      });
      mockPrismaService.referee.findUnique.mockResolvedValue(mockReferee);

      await expect(
        service.reportMatchResult(
          {
            matchId: 'match-1',
            homeScore: -1,
            awayScore: 2,
          },
          'referee-user-1'
        )
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createDispute', () => {
    it('should create a dispute for a match', async () => {
      mockPrismaService.match.findUnique.mockResolvedValue(mockMatch);
      mockPrismaService.match.update.mockResolvedValue({
        ...mockMatch,
        status: 'DISPUTED',
      });

      const result = await service.createDispute(
        'match-1',
        'Score reporting discrepancy',
        'p1'
      );

      expect(result.status).toBe('DISPUTED');
      expect(mockPrismaService.match.update).toHaveBeenCalledWith({
        where: { id: 'match-1' },
        data: {
          status: 'DISPUTED',
          metadata: expect.objectContaining({
            dispute: expect.objectContaining({
              reason: 'Score reporting discrepancy',
              reportedBy: 'p1',
              status: 'PENDING',
            }),
          }),
        },
        include: expect.any(Object),
      });
    });

    it('should throw error if match not found', async () => {
      mockPrismaService.match.findUnique.mockResolvedValue(null);

      await expect(
        service.createDispute('invalid-id', 'Reason', 'p1')
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error if match already disputed', async () => {
      mockPrismaService.match.findUnique.mockResolvedValue({
        ...mockMatch,
        status: 'DISPUTED',
      });

      await expect(
        service.createDispute('match-1', 'Reason', 'p1')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('resolveDispute', () => {
    it('should approve dispute and mark match as completed', async () => {
      mockPrismaService.match.findUnique.mockResolvedValue({
        ...mockMatch,
        status: 'DISPUTED',
        tournament: mockTournament,
        metadata: {
          dispute: {
            reason: 'Score discrepancy',
            reportedBy: 'p1',
            status: 'PENDING',
          },
        },
      });

      mockPrismaService.referee.findUnique.mockResolvedValue(mockReferee);

      mockPrismaService.match.update.mockResolvedValue({
        ...mockMatch,
        status: 'COMPLETED',
      });

      const result = await service.resolveDispute(
        'match-1',
        'approve',
        'referee-user-1',
        'Dispute valid'
      );

      expect(result.status).toBe('COMPLETED');
      expect(mockPrismaService.match.update).toHaveBeenCalledWith({
        where: { id: 'match-1' },
        data: {
          status: 'COMPLETED',
          metadata: expect.objectContaining({
            dispute: expect.objectContaining({
              status: 'APPROVED',
              resolvedBy: 'referee-user-1',
              resolution: 'approve',
              notes: 'Dispute valid',
            }),
          }),
        },
        include: expect.any(Object),
      });
    });

    it('should reject dispute and revert to previous status', async () => {
      mockPrismaService.match.findUnique.mockResolvedValue({
        ...mockMatch,
        status: 'DISPUTED',
        tournament: mockTournament,
        metadata: {
          dispute: {
            reason: 'Score discrepancy',
            reportedBy: 'p1',
            status: 'PENDING',
            previousStatus: 'COMPLETED',
          },
        },
      });

      mockPrismaService.referee.findUnique.mockResolvedValue(mockReferee);

      mockPrismaService.match.update.mockResolvedValue({
        ...mockMatch,
        status: 'COMPLETED',
      });

      const result = await service.resolveDispute(
        'match-1',
        'reject',
        'referee-user-1',
        'Dispute invalid'
      );

      expect(result.status).toBe('COMPLETED');
    });

    it('should replay match if resolution is replay', async () => {
      mockPrismaService.match.findUnique.mockResolvedValue({
        ...mockMatch,
        status: 'DISPUTED',
        tournament: mockTournament,
        metadata: {
          dispute: {
            reason: 'Technical issue',
            reportedBy: 'p1',
            status: 'PENDING',
          },
        },
      });

      mockPrismaService.referee.findUnique.mockResolvedValue(mockReferee);

      mockPrismaService.match.update.mockResolvedValue({
        ...mockMatch,
        status: 'SCHEDULED',
        homeScore: 0,
        awayScore: 0,
      });

      const result = await service.resolveDispute(
        'match-1',
        'replay',
        'referee-user-1',
        'Match will be replayed'
      );

      expect(result.status).toBe('SCHEDULED');
      expect(result.homeScore).toBe(0);
      expect(result.awayScore).toBe(0);
    });

    it('should throw error if not assigned as referee', async () => {
      mockPrismaService.match.findUnique.mockResolvedValue({
        ...mockMatch,
        status: 'DISPUTED',
        tournament: mockTournament,
      });
      mockPrismaService.referee.findUnique.mockResolvedValue(null);

      await expect(
        service.resolveDispute('match-1', 'approve', 'random-user')
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw error if match not disputed', async () => {
      mockPrismaService.match.findUnique.mockResolvedValue({
        ...mockMatch,
        status: 'COMPLETED',
        tournament: mockTournament,
      });
      mockPrismaService.referee.findUnique.mockResolvedValue(mockReferee);

      await expect(
        service.resolveDispute('match-1', 'approve', 'referee-user-1')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getMatchesRequiringAttention', () => {
    it('should return matches that need referee attention', async () => {
      const disputedMatches = [
        { ...mockMatch, status: 'DISPUTED' },
        {
          ...mockMatch,
          id: 'match-2',
          status: 'IN_PROGRESS',
          startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        },
      ];

      mockPrismaService.match.findMany.mockResolvedValue(disputedMatches);

      const result = await service.getMatchesRequiringAttention('referee-user-1');

      expect(result.length).toBeGreaterThan(0);
      expect(mockPrismaService.match.findMany).toHaveBeenCalled();
    });
  });
});
