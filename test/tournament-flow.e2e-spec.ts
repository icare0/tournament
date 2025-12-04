import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/common/prisma/prisma.service';

describe('Tournament Flow (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let organizerToken: string;
  let participantTokens: string[] = [];
  let tournamentId: string;
  let participantIds: string[] = [];
  let matchIds: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Clean database before tests
    await prisma.match.deleteMany();
    await prisma.participant.deleteMany();
    await prisma.referee.deleteMany();
    await prisma.tournament.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('1. User Registration and Authentication', () => {
    it('should register an organizer', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'organizer@test.com',
          password: 'StrongPass123!',
          username: 'TournamentOrg',
          role: 'ORGANIZER',
        })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      organizerToken = response.body.accessToken;
    });

    it('should register 8 participants', async () => {
      for (let i = 1; i <= 8; i++) {
        const response = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            email: `player${i}@test.com`,
            password: 'StrongPass123!',
            username: `Player${i}`,
            role: 'PLAYER',
          })
          .expect(201);

        participantTokens.push(response.body.accessToken);

        // Create wallet for each participant
        const user = await prisma.user.findUnique({
          where: { email: `player${i}@test.com` },
        });

        await prisma.wallet.create({
          data: {
            userId: user.id,
            balance: 500, // $500 starting balance
            lockedBalance: 0,
          },
        });
      }

      expect(participantTokens).toHaveLength(8);
    });
  });

  describe('2. Tournament Creation', () => {
    it('should create a tournament with entry fee', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/tournaments')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          name: 'E2E Test Championship',
          description: 'End-to-end test tournament',
          game: 'CS:GO',
          type: 'SINGLE_ELIMINATION',
          visibility: 'PUBLIC',
          maxParticipants: 8,
          entryFee: 50,
          prizePool: 320, // 80% of total entry fees (8 * 50 * 0.8)
          registrationStart: new Date().toISOString(),
          registrationEnd: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          startDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          rules: {
            bestOf: 3,
            mapPool: ['Dust2', 'Mirage', 'Inferno'],
          },
          prizes: {
            1: 200,
            2: 80,
            3: 40,
          },
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('E2E Test Championship');
      expect(response.body.entryFee).toBe(50);
      tournamentId = response.body.id;
    });

    it('should retrieve tournament details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/tournaments/${tournamentId}`)
        .expect(200);

      expect(response.body.id).toBe(tournamentId);
      expect(response.body.status).toBe('DRAFT');
    });
  });

  describe('3. Participant Registration', () => {
    it('should register all 8 participants', async () => {
      for (let i = 0; i < 8; i++) {
        const response = await request(app.getHttpServer())
          .post(`/api/v1/tournaments/${tournamentId}/register`)
          .set('Authorization', `Bearer ${participantTokens[i]}`)
          .send({})
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.status).toBe('REGISTERED');
        participantIds.push(response.body.id);

        // Verify wallet was locked with entry fee
        const user = await prisma.user.findUnique({
          where: { email: `player${i + 1}@test.com` },
          include: { wallet: true },
        });

        expect(user.wallet.lockedBalance).toBe(50);
      }

      expect(participantIds).toHaveLength(8);
    });

    it('should not allow 9th participant to register (tournament full)', async () => {
      // Create 9th player
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'player9@test.com',
          password: 'StrongPass123!',
          username: 'Player9',
        });

      const extraPlayerToken = response.body.accessToken;

      await request(app.getHttpServer())
        .post(`/api/v1/tournaments/${tournamentId}/register`)
        .set('Authorization', `Bearer ${extraPlayerToken}`)
        .send({})
        .expect(400); // Tournament full
    });

    it('should check-in all participants', async () => {
      for (let i = 0; i < 8; i++) {
        await request(app.getHttpServer())
          .post(`/api/v1/tournaments/${tournamentId}/participants/${participantIds[i]}/check-in`)
          .set('Authorization', `Bearer ${participantTokens[i]}`)
          .send({})
          .expect(200);
      }

      // Verify all participants are checked in
      const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
        include: { participants: true },
      });

      const checkedInCount = tournament.participants.filter(
        (p) => p.status === 'CHECKED_IN'
      ).length;

      expect(checkedInCount).toBe(8);
    });
  });

  describe('4. Bracket Generation', () => {
    it('should auto-seed participants', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/tournaments/${tournamentId}/participants/auto-seed`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({ method: 'random' })
        .expect(200);

      // Verify all participants have seeds
      const participants = await prisma.participant.findMany({
        where: { tournamentId },
      });

      const seededCount = participants.filter((p) => p.seed !== null).length;
      expect(seededCount).toBe(8);
    });

    it('should generate bracket', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/tournaments/${tournamentId}/bracket/generate`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({})
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.matchesCreated).toBeGreaterThan(0);

      // For 8 participants single elimination: 4 + 2 + 1 = 7 matches
      expect(response.body.matchesCreated).toBe(7);

      // Get all matches
      const matches = await prisma.match.findMany({
        where: { tournamentId },
        orderBy: [{ round: 'asc' }, { matchNumber: 'asc' }],
      });

      matchIds = matches.map((m) => m.id);
      expect(matchIds).toHaveLength(7);
    });

    it('should retrieve bracket structure', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/tournaments/${tournamentId}/bracket`)
        .expect(200);

      expect(response.body).toHaveProperty('winnersBracket');
      expect(response.body.winnersBracket[0].matches).toHaveLength(4); // Round 1
      expect(response.body.winnersBracket[1].matches).toHaveLength(2); // Round 2
      expect(response.body.winnersBracket[2].matches).toHaveLength(1); // Finals
    });
  });

  describe('5. Start Tournament', () => {
    it('should start tournament', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/tournaments/${tournamentId}/start`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({})
        .expect(200);

      const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
      });

      expect(tournament.status).toBe('IN_PROGRESS');
    });
  });

  describe('6. Play Matches - Quarter Finals (Round 1)', () => {
    it('should start and complete all Round 1 matches', async () => {
      const round1Matches = await prisma.match.findMany({
        where: { tournamentId, round: 1 },
        include: { homeParticipant: true, awayParticipant: true },
      });

      expect(round1Matches).toHaveLength(4);

      for (const match of round1Matches) {
        // Start match
        await request(app.getHttpServer())
          .post(`/api/v1/matches/${match.id}/start`)
          .set('Authorization', `Bearer ${organizerToken}`)
          .send({})
          .expect(200);

        // Update score (home team wins 2-1)
        await request(app.getHttpServer())
          .patch(`/api/v1/matches/${match.id}/score`)
          .set('Authorization', `Bearer ${organizerToken}`)
          .send({
            homeScore: 2,
            awayScore: 1,
            winnerId: match.homeParticipantId,
          })
          .expect(200);

        // Verify match completed
        const updatedMatch = await prisma.match.findUnique({
          where: { id: match.id },
        });

        expect(updatedMatch.status).toBe('COMPLETED');
        expect(updatedMatch.winnerId).toBe(match.homeParticipantId);
      }
    });

    it('should advance winners to Round 2', async () => {
      const round2Matches = await prisma.match.findMany({
        where: { tournamentId, round: 2 },
      });

      // All Round 2 matches should have participants assigned
      const filledMatches = round2Matches.filter(
        (m) => m.homeParticipantId && m.awayParticipantId
      );

      expect(filledMatches).toHaveLength(2);
    });
  });

  describe('7. Play Matches - Semi Finals (Round 2)', () => {
    it('should complete all Round 2 matches', async () => {
      const round2Matches = await prisma.match.findMany({
        where: { tournamentId, round: 2 },
      });

      for (const match of round2Matches) {
        await request(app.getHttpServer())
          .post(`/api/v1/matches/${match.id}/start`)
          .set('Authorization', `Bearer ${organizerToken}`)
          .send({});

        await request(app.getHttpServer())
          .patch(`/api/v1/matches/${match.id}/score`)
          .set('Authorization', `Bearer ${organizerToken}`)
          .send({
            homeScore: 2,
            awayScore: 0,
            winnerId: match.homeParticipantId,
          })
          .expect(200);
      }
    });
  });

  describe('8. Play Matches - Finals (Round 3)', () => {
    it('should complete the final match', async () => {
      const finalMatch = await prisma.match.findFirst({
        where: { tournamentId, round: 3 },
      });

      expect(finalMatch).toBeDefined();

      await request(app.getHttpServer())
        .post(`/api/v1/matches/${finalMatch.id}/start`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({});

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/matches/${finalMatch.id}/score`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          homeScore: 2,
          awayScore: 1,
          winnerId: finalMatch.homeParticipantId,
        })
        .expect(200);

      expect(response.body.status).toBe('COMPLETED');

      // Verify winner has final rank
      const winner = await prisma.participant.findUnique({
        where: { id: finalMatch.homeParticipantId },
      });

      expect(winner.finalRank).toBe(1);
    });
  });

  describe('9. Tournament Completion and Analytics', () => {
    it('should get tournament analytics', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/analytics/tournaments/${tournamentId}/analytics`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('tournament');
      expect(response.body).toHaveProperty('totalParticipants', 8);
      expect(response.body).toHaveProperty('totalMatches', 7);
      expect(response.body).toHaveProperty('completedMatches', 7);
      expect(response.body).toHaveProperty('completionRate', 100);
      expect(response.body).toHaveProperty('topPerformers');
      expect(response.body.topPerformers.length).toBeGreaterThan(0);
    });

    it('should export tournament analytics to CSV', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/analytics/export/tournament/${tournamentId}/csv`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .expect(200);

      expect(response.text).toContain('TOURNAMENT INFORMATION');
      expect(response.text).toContain('PARTICIPANTS');
      expect(response.text).toContain('MATCHES');
    });

    it('should get participant stats', async () => {
      const winnerId = participantIds[0];

      const response = await request(app.getHttpServer())
        .get(`/api/v1/tournaments/${tournamentId}/participants/${winnerId}/stats`)
        .expect(200);

      expect(response.body).toHaveProperty('participant');
      expect(response.body).toHaveProperty('stats');
      expect(response.body.stats).toHaveProperty('totalMatches');
      expect(response.body.stats).toHaveProperty('wins');
      expect(response.body.stats).toHaveProperty('winRate');
    });
  });

  describe('10. Financial Validation', () => {
    it('should validate transaction integrity', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/billing/admin/validate-integrity')
        .set('Authorization', `Bearer ${organizerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('isValid', true);
      expect(response.body).toHaveProperty('totalDebits');
      expect(response.body).toHaveProperty('totalCredits');
      expect(response.body.totalDebits).toBe(response.body.totalCredits);
      expect(response.body).toHaveProperty('issues');
      expect(response.body.issues).toHaveLength(0);
    });

    it('should get financial summary', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/billing/admin/financial-summary?period=month')
        .set('Authorization', `Bearer ${organizerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('period', 'month');
      expect(response.body).toHaveProperty('entryFees');
      expect(response.body).toHaveProperty('deposits');
      expect(response.body).toHaveProperty('withdrawals');
    });
  });

  describe('11. Dispute Flow', () => {
    it('should create and resolve a dispute', async () => {
      // Create a new match for dispute testing
      const testMatch = await prisma.match.create({
        data: {
          tournamentId,
          round: 4,
          matchNumber: 1,
          status: 'COMPLETED',
          homeParticipantId: participantIds[0],
          awayParticipantId: participantIds[1],
          homeScore: 2,
          awayScore: 1,
          winnerId: participantIds[0],
          bestOf: 3,
        },
      });

      // Create a referee
      const refereeResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'referee@test.com',
          password: 'StrongPass123!',
          username: 'Referee1',
          role: 'REFEREE',
        });

      const refereeToken = refereeResponse.body.accessToken;

      // Assign referee
      await request(app.getHttpServer())
        .post(`/api/v1/referees/tournaments/${tournamentId}/assign`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          refereeUserId: refereeResponse.body.user.id,
          permissions: ['REPORT_RESULTS', 'RESOLVE_DISPUTES'],
        })
        .expect(201);

      // Create dispute
      await request(app.getHttpServer())
        .post(`/api/v1/referees/matches/${testMatch.id}/dispute`)
        .set('Authorization', `Bearer ${participantTokens[1]}`)
        .send({
          reason: 'Score reporting error',
        })
        .expect(201);

      // Verify dispute created
      const disputedMatch = await prisma.match.findUnique({
        where: { id: testMatch.id },
      });

      expect(disputedMatch.status).toBe('DISPUTED');

      // Resolve dispute
      await request(app.getHttpServer())
        .post(`/api/v1/referees/matches/${testMatch.id}/dispute/resolve`)
        .set('Authorization', `Bearer ${refereeToken}`)
        .send({
          resolution: 'approve',
          notes: 'Verified with VOD',
        })
        .expect(200);

      // Verify dispute resolved
      const resolvedMatch = await prisma.match.findUnique({
        where: { id: testMatch.id },
      });

      expect(resolvedMatch.status).toBe('COMPLETED');
    });
  });
});
