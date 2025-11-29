/**
 * AnalyticsQueryService - Requêtes JSONB optimisées pour Analytics
 *
 * Ce service démontre comment exploiter les capacités JSONB de PostgreSQL
 * pour extraire des statistiques depuis des données hétérogènes.
 *
 * Cas d'usage:
 * - GameStats stocke des données différentes selon le jeu (JSONB)
 * - CS:GO: { kills, deaths, assists, headshots }
 * - FIFA: { goals, assists, tackles }
 * - League of Legends: { kills, deaths, assists, cs, gold }
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { Prisma } from '@prisma/client';

export interface TopPlayerStat {
  userId: string;
  username: string;
  email: string;
  totalMatches: number;
  statValue: number; // Kills, goals, etc.
  averagePerMatch: number;
}

export interface PlayerPerformance {
  userId: string;
  username: string;
  kills?: number;
  deaths?: number;
  assists?: number;
  kda?: number; // (Kills + Assists) / Deaths
  headshots?: number;
  damage?: number;
}

@Injectable()
export class AnalyticsQueryService {
  private readonly logger = new Logger(AnalyticsQueryService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * TOP 10 JOUEURS PAR KILLS (tous jeux confondus)
   *
   * Utilise JSONB extraction avec l'opérateur ->>
   * Cast en INTEGER pour pouvoir faire des SUM/AVG
   */
  async getTop10PlayersByKills(game?: string): Promise<TopPlayerStat[]> {
    this.logger.log('Fetching top 10 players by kills...');

    const query = `
      SELECT
        u.id as "userId",
        u.username,
        u.email,
        COUNT(DISTINCT gs.id) as "totalMatches",
        SUM((gs.stats->>'kills')::INTEGER) as "statValue",
        AVG((gs.stats->>'kills')::INTEGER) as "averagePerMatch"
      FROM "game_stats" gs
      INNER JOIN "users" u ON gs."userId" = u.id
      INNER JOIN "matches" m ON gs."matchId" = m.id
      ${game ? `INNER JOIN "tournaments" t ON m."tournamentId" = t.id WHERE t.game = $1` : ''}
      WHERE gs.stats ? 'kills'  -- Vérifier que la clé 'kills' existe
        AND (gs.stats->>'kills')::INTEGER > 0
      GROUP BY u.id, u.username, u.email
      ORDER BY "statValue" DESC
      LIMIT 10
    `;

    const params = game ? [game] : [];

    const result = await this.prisma.$queryRawUnsafe<TopPlayerStat[]>(
      query,
      ...params,
    );

    this.logger.log(`Found ${result.length} top players`);
    return result;
  }

  /**
   * TOP 10 JOUEURS PAR GOALS (pour FIFA, Rocket League, etc.)
   */
  async getTop10PlayersByGoals(game?: string): Promise<TopPlayerStat[]> {
    this.logger.log('Fetching top 10 players by goals...');

    const query = `
      SELECT
        u.id as "userId",
        u.username,
        u.email,
        COUNT(DISTINCT gs.id) as "totalMatches",
        SUM((gs.stats->>'goals')::INTEGER) as "statValue",
        AVG((gs.stats->>'goals')::INTEGER) as "averagePerMatch"
      FROM "game_stats" gs
      INNER JOIN "users" u ON gs."userId" = u.id
      INNER JOIN "matches" m ON gs."matchId" = m.id
      ${game ? `INNER JOIN "tournaments" t ON m."tournamentId" = t.id WHERE t.game = $1` : ''}
      WHERE gs.stats ? 'goals'
        AND (gs.stats->>'goals')::INTEGER > 0
      GROUP BY u.id, u.username, u.email
      ORDER BY "statValue" DESC
      LIMIT 10
    `;

    const params = game ? [game] : [];

    return await this.prisma.$queryRawUnsafe<TopPlayerStat[]>(query, ...params);
  }

  /**
   * PERFORMANCE DÉTAILLÉE D'UN JOUEUR (avec KDA)
   *
   * Extrait plusieurs champs du JSONB et calcule le KDA
   * KDA = (Kills + Assists) / Deaths
   */
  async getPlayerPerformance(
    userId: string,
    game?: string,
  ): Promise<PlayerPerformance> {
    this.logger.log(`Fetching performance for user ${userId}`);

    const query = `
      SELECT
        u.id as "userId",
        u.username,
        SUM((gs.stats->>'kills')::INTEGER) as kills,
        SUM((gs.stats->>'deaths')::INTEGER) as deaths,
        SUM((gs.stats->>'assists')::INTEGER) as assists,
        -- KDA calculation: (Kills + Assists) / Deaths (avoid division by zero)
        CASE
          WHEN SUM((gs.stats->>'deaths')::INTEGER) > 0
          THEN (SUM((gs.stats->>'kills')::INTEGER) + SUM((gs.stats->>'assists')::INTEGER))::DECIMAL
               / SUM((gs.stats->>'deaths')::INTEGER)
          ELSE SUM((gs.stats->>'kills')::INTEGER) + SUM((gs.stats->>'assists')::INTEGER)
        END as kda,
        SUM((gs.stats->>'headshots')::INTEGER) as headshots,
        SUM((gs.stats->>'damage')::INTEGER) as damage
      FROM "game_stats" gs
      INNER JOIN "users" u ON gs."userId" = u.id
      INNER JOIN "matches" m ON gs."matchId" = m.id
      ${game ? `INNER JOIN "tournaments" t ON m."tournamentId" = t.id WHERE t.game = $1 AND` : 'WHERE'}
      u.id = ${game ? '$2' : '$1'}
      GROUP BY u.id, u.username
    `;

    const params = game ? [game, userId] : [userId];

    const result = await this.prisma.$queryRawUnsafe<PlayerPerformance[]>(
      query,
      ...params,
    );

    return result[0] || null;
  }

  /**
   * STATISTIQUES PAR JEU (nombre de joueurs, matchs, moyenne kills)
   */
  async getStatsByGame() {
    this.logger.log('Fetching stats by game...');

    const query = `
      SELECT
        t.game,
        COUNT(DISTINCT gs."userId") as "totalPlayers",
        COUNT(DISTINCT gs."matchId") as "totalMatches",
        AVG((gs.stats->>'kills')::INTEGER) as "avgKills",
        AVG((gs.stats->>'deaths')::INTEGER) as "avgDeaths",
        MAX((gs.stats->>'kills')::INTEGER) as "maxKills"
      FROM "game_stats" gs
      INNER JOIN "matches" m ON gs."matchId" = m.id
      INNER JOIN "tournaments" t ON m."tournamentId" = t.id
      WHERE gs.stats ? 'kills'
      GROUP BY t.game
      ORDER BY "totalPlayers" DESC
    `;

    return await this.prisma.$queryRaw(Prisma.sql([query]));
  }

  /**
   * RECHERCHE AVANCÉE DANS LE JSONB
   * Exemple: Trouver tous les joueurs avec plus de 20 kills dans un match
   */
  async findPlayersWithHighKills(minKills: number = 20) {
    this.logger.log(`Finding players with ${minKills}+ kills in a match...`);

    const query = `
      SELECT
        u.username,
        u.email,
        m.id as "matchId",
        (gs.stats->>'kills')::INTEGER as kills,
        (gs.stats->>'deaths')::INTEGER as deaths,
        gs.stats->>'champion' as champion,
        m."scheduledAt"
      FROM "game_stats" gs
      INNER JOIN "users" u ON gs."userId" = u.id
      INNER JOIN "matches" m ON gs."matchId" = m.id
      WHERE (gs.stats->>'kills')::INTEGER >= $1
      ORDER BY kills DESC
      LIMIT 100
    `;

    return await this.prisma.$queryRawUnsafe(query, minKills);
  }

  /**
   * UTILISATION DE L'OPÉRATEUR @> (contains)
   * Trouver toutes les parties où un joueur a joué un champion spécifique
   */
  async findMatchesByChampion(championName: string) {
    this.logger.log(`Finding matches with champion: ${championName}`);

    // L'opérateur @> vérifie si le JSONB contient l'objet spécifié
    const query = `
      SELECT
        u.username,
        m.id as "matchId",
        gs.stats
      FROM "game_stats" gs
      INNER JOIN "users" u ON gs."userId" = u.id
      INNER JOIN "matches" m ON gs."matchId" = m.id
      WHERE gs.stats @> $1::jsonb
      LIMIT 50
    `;

    const searchObject = JSON.stringify({ champion: championName });

    return await this.prisma.$queryRawUnsafe(query, searchObject);
  }

  /**
   * OPÉRATEUR ? (key exists)
   * Trouver tous les game_stats qui ont une clé spécifique
   */
  async findStatsByKey(key: string) {
    this.logger.log(`Finding stats with key: ${key}`);

    const query = `
      SELECT
        COUNT(*) as count,
        AVG((stats->>'${key}')::NUMERIC) as average,
        MIN((stats->>'${key}')::NUMERIC) as min,
        MAX((stats->>'${key}')::NUMERIC) as max
      FROM "game_stats"
      WHERE stats ? '${key}'
    `;

    return await this.prisma.$queryRaw(Prisma.sql([query]));
  }

  /**
   * OPTIMISATION: Utiliser un INDEX JSONB
   *
   * Pour améliorer les performances des requêtes JSONB, créer des index:
   *
   * -- Index GIN (Generalized Inverted Index) pour opérateur @> et ?
   * CREATE INDEX idx_game_stats_jsonb_gin ON game_stats USING GIN (stats);
   *
   * -- Index sur une clé spécifique (kills)
   * CREATE INDEX idx_game_stats_kills ON game_stats ((stats->>'kills')::INTEGER);
   *
   * -- Index composite
   * CREATE INDEX idx_game_stats_kda ON game_stats (
   *   (stats->>'kills')::INTEGER,
   *   (stats->>'deaths')::INTEGER,
   *   (stats->>'assists')::INTEGER
   * );
   */

  /**
   * AGRÉGATION COMPLEXE: Leaderboard global avec WIN RATE
   */
  async getGlobalLeaderboard(limit: number = 100) {
    this.logger.log('Fetching global leaderboard...');

    const query = `
      WITH player_matches AS (
        SELECT
          p."userId",
          COUNT(DISTINCT p.id) as total_matches,
          SUM(CASE WHEN m."winnerId" = p.id THEN 1 ELSE 0 END) as wins
        FROM "participants" p
        INNER JOIN "matches" m ON (
          m."homeParticipantId" = p.id OR m."awayParticipantId" = p.id
        )
        WHERE m.status = 'COMPLETED'
        GROUP BY p."userId"
      ),
      player_stats AS (
        SELECT
          gs."userId",
          SUM((gs.stats->>'kills')::INTEGER) as total_kills,
          SUM((gs.stats->>'deaths')::INTEGER) as total_deaths,
          SUM((gs.stats->>'assists')::INTEGER) as total_assists
        FROM "game_stats" gs
        WHERE gs.stats ? 'kills'
        GROUP BY gs."userId"
      )
      SELECT
        u.id as "userId",
        u.username,
        u.avatar,
        pm.total_matches as "totalMatches",
        pm.wins,
        ROUND((pm.wins::DECIMAL / pm.total_matches * 100), 2) as "winRate",
        ps.total_kills as "totalKills",
        ps.total_deaths as "totalDeaths",
        ps.total_assists as "totalAssists",
        CASE
          WHEN ps.total_deaths > 0
          THEN ROUND((ps.total_kills + ps.total_assists)::DECIMAL / ps.total_deaths, 2)
          ELSE ps.total_kills + ps.total_assists
        END as kda
      FROM "users" u
      INNER JOIN player_matches pm ON u.id = pm."userId"
      LEFT JOIN player_stats ps ON u.id = ps."userId"
      WHERE pm.total_matches >= 5  -- Minimum 5 matchs joués
      ORDER BY "winRate" DESC, kda DESC
      LIMIT $1
    `;

    return await this.prisma.$queryRawUnsafe(query, limit);
  }

  /**
   * MIGRATION: Ajouter des index pour optimiser les requêtes JSONB
   * À exécuter via une migration Prisma
   */
  async createJsonbIndexes() {
    this.logger.log('Creating JSONB indexes...');

    const queries = [
      // Index GIN pour recherches générales
      `CREATE INDEX IF NOT EXISTS idx_game_stats_jsonb_gin
       ON "game_stats" USING GIN (stats);`,

      // Index sur kills
      `CREATE INDEX IF NOT EXISTS idx_game_stats_kills
       ON "game_stats" (((stats->>'kills')::INTEGER));`,

      // Index sur deaths
      `CREATE INDEX IF NOT EXISTS idx_game_stats_deaths
       ON "game_stats" (((stats->>'deaths')::INTEGER));`,

      // Index sur assists
      `CREATE INDEX IF NOT EXISTS idx_game_stats_assists
       ON "game_stats" (((stats->>'assists')::INTEGER));`,
    ];

    for (const query of queries) {
      try {
        await this.prisma.$executeRawUnsafe(query);
        this.logger.log(`✅ Index created`);
      } catch (error) {
        this.logger.warn(`⚠️  Index creation skipped (may already exist)`);
      }
    }

    this.logger.log('✅ JSONB indexes setup complete');
  }
}

/**
 * EXEMPLE D'UTILISATION
 *
 * ```typescript
 * @Controller('analytics')
 * export class AnalyticsController {
 *   constructor(private analyticsQuery: AnalyticsQueryService) {}
 *
 *   @Get('top-players/kills')
 *   async getTopKillers(@Query('game') game?: string) {
 *     return this.analyticsQuery.getTop10PlayersByKills(game);
 *   }
 *
 *   @Get('player/:id/performance')
 *   async getPlayerPerf(@Param('id') userId: string, @Query('game') game?: string) {
 *     return this.analyticsQuery.getPlayerPerformance(userId, game);
 *   }
 *
 *   @Get('leaderboard')
 *   async getLeaderboard(@Query('limit') limit: number = 100) {
 *     return this.analyticsQuery.getGlobalLeaderboard(limit);
 *   }
 * }
 * ```
 */

/**
 * EXEMPLE DE DONNÉES JSONB DANS GameStats
 *
 * CS:GO:
 * {
 *   "kills": 25,
 *   "deaths": 12,
 *   "assists": 8,
 *   "headshots": 15,
 *   "damage": 4500,
 *   "mvpStars": 3
 * }
 *
 * FIFA:
 * {
 *   "goals": 3,
 *   "assists": 2,
 *   "tackles": 12,
 *   "passes": 450,
 *   "passAccuracy": 87.5,
 *   "shotsOnTarget": 5
 * }
 *
 * League of Legends:
 * {
 *   "kills": 8,
 *   "deaths": 2,
 *   "assists": 15,
 *   "cs": 245,
 *   "gold": 15000,
 *   "champion": "Yasuo",
 *   "role": "Mid"
 * }
 */
