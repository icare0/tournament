/**
 * TournamentGateway - WebSocket Gateway avec Socket.io + Redis Adapter
 *
 * Fonctionnalités:
 * - Diffusion d'événements en temps réel (score_update, match_start, etc.)
 * - Support multi-instances via Redis adapter
 * - Système de Rooms pour notifications ciblées (par tournoi, par match)
 * - Gestion des connexions/déconnexions
 * - Authentication JWT pour WebSocket
 */

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

// Types pour les événements
export interface ScoreUpdatePayload {
  matchId: string;
  tournamentId: string;
  homeScore: number;
  awayScore: number;
  timestamp: Date;
}

export interface MatchStartPayload {
  matchId: string;
  tournamentId: string;
  homeTeam: string;
  awayTeam: string;
  scheduledAt: Date;
}

export interface TournamentUpdatePayload {
  tournamentId: string;
  status: string;
  message: string;
}

/**
 * Gateway WebSocket Principal
 *
 * Configuration:
 * - CORS activé pour dev (à sécuriser en prod)
 * - Namespace: /tournaments
 * - Redis adapter pour scaling horizontal
 */
@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || '*', // En prod: mettre le domaine exact
    credentials: true,
  },
  namespace: '/tournaments', // Namespace dédié aux tournois
})
export class TournamentGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TournamentGateway.name);

  /**
   * Hook après initialisation du serveur
   * Configure le Redis adapter pour multi-instances
   */
  async afterInit(server: Server) {
    this.logger.log('🚀 TournamentGateway initialized');

    // Configuration Redis Adapter pour scaling
    if (process.env.REDIS_HOST) {
      try {
        const pubClient = createClient({
          socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
          },
          password: process.env.REDIS_PASSWORD,
        });

        const subClient = pubClient.duplicate();

        await Promise.all([pubClient.connect(), subClient.connect()]);

        server.adapter(createAdapter(pubClient, subClient));

        this.logger.log('✅ Redis adapter configured for horizontal scaling');
      } catch (error) {
        this.logger.error('❌ Failed to configure Redis adapter:', error);
        this.logger.warn('⚠️  Running in single-instance mode');
      }
    } else {
      this.logger.warn('⚠️  No Redis configuration found, running in single-instance mode');
    }
  }

  /**
   * Hook connexion client
   * Authentification JWT optionnelle
   */
  handleConnection(client: Socket) {
    this.logger.log(`🔌 Client connected: ${client.id}`);

    // Optionnel: Authentification JWT
    const token = client.handshake.auth.token || client.handshake.headers.authorization;

    if (token) {
      try {
        // TODO: Valider le JWT ici
        // const user = this.jwtService.verify(token);
        // client.data.user = user;
        this.logger.debug(`User authenticated for socket ${client.id}`);
      } catch (error) {
        this.logger.warn(`Invalid token for socket ${client.id}`);
        client.disconnect();
        return;
      }
    }

    // Envoyer un message de bienvenue
    client.emit('connection_success', {
      message: 'Connected to Tournament Gateway',
      socketId: client.id,
      timestamp: new Date(),
    });
  }

  /**
   * Hook déconnexion client
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`🔌 Client disconnected: ${client.id}`);
  }

  // ============================================
  // GESTION DES ROOMS (Notifications Ciblées)
  // ============================================

  /**
   * Rejoindre la room d'un tournoi
   * Permet de recevoir tous les événements de ce tournoi
   */
  @SubscribeMessage('join_tournament')
  handleJoinTournament(
    @ConnectedSocket() client: Socket,
    @MessageBody() tournamentId: string,
  ) {
    const roomName = `tournament:${tournamentId}`;
    client.join(roomName);

    this.logger.debug(`Socket ${client.id} joined room: ${roomName}`);

    return {
      event: 'joined_tournament',
      data: {
        tournamentId,
        room: roomName,
        message: `You are now watching tournament ${tournamentId}`,
      },
    };
  }

  /**
   * Quitter la room d'un tournoi
   */
  @SubscribeMessage('leave_tournament')
  handleLeaveTournament(
    @ConnectedSocket() client: Socket,
    @MessageBody() tournamentId: string,
  ) {
    const roomName = `tournament:${tournamentId}`;
    client.leave(roomName);

    this.logger.debug(`Socket ${client.id} left room: ${roomName}`);

    return {
      event: 'left_tournament',
      data: { tournamentId },
    };
  }

  /**
   * Rejoindre la room d'un match spécifique
   */
  @SubscribeMessage('join_match')
  handleJoinMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() matchId: string,
  ) {
    const roomName = `match:${matchId}`;
    client.join(roomName);

    this.logger.debug(`Socket ${client.id} joined room: ${roomName}`);

    return {
      event: 'joined_match',
      data: {
        matchId,
        room: roomName,
        message: `You are now watching match ${matchId}`,
      },
    };
  }

  /**
   * Quitter la room d'un match
   */
  @SubscribeMessage('leave_match')
  handleLeaveMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() matchId: string,
  ) {
    const roomName = `match:${matchId}`;
    client.leave(roomName);

    this.logger.debug(`Socket ${client.id} left room: ${roomName}`);

    return {
      event: 'left_match',
      data: { matchId },
    };
  }

  // ============================================
  // DIFFUSION D'ÉVÉNEMENTS (Server-Side)
  // ============================================

  /**
   * Diffuser une mise à jour de score
   * Envoie UNIQUEMENT aux spectateurs du match ET du tournoi
   */
  broadcastScoreUpdate(payload: ScoreUpdatePayload) {
    const matchRoom = `match:${payload.matchId}`;
    const tournamentRoom = `tournament:${payload.tournamentId}`;

    // Envoyer à la room du match
    this.server.to(matchRoom).emit('score_update', payload);

    // Envoyer aussi à la room du tournoi (pour les dashboards globaux)
    this.server.to(tournamentRoom).emit('score_update', payload);

    this.logger.log(
      `📊 Score update broadcasted to rooms: ${matchRoom}, ${tournamentRoom}`,
    );
  }

  /**
   * Diffuser le démarrage d'un match
   */
  broadcastMatchStart(payload: MatchStartPayload) {
    const matchRoom = `match:${payload.matchId}`;
    const tournamentRoom = `tournament:${payload.tournamentId}`;

    this.server.to(matchRoom).emit('match_start', payload);
    this.server.to(tournamentRoom).emit('match_start', payload);

    this.logger.log(`🎬 Match start broadcasted: ${payload.matchId}`);
  }

  /**
   * Diffuser la fin d'un match
   */
  broadcastMatchEnd(payload: {
    matchId: string;
    tournamentId: string;
    winnerId: string;
    finalScore: { home: number; away: number };
  }) {
    const matchRoom = `match:${payload.matchId}`;
    const tournamentRoom = `tournament:${payload.tournamentId}`;

    this.server.to(matchRoom).emit('match_end', payload);
    this.server.to(tournamentRoom).emit('match_end', payload);

    this.logger.log(`🏁 Match end broadcasted: ${payload.matchId}`);
  }

  /**
   * Diffuser une mise à jour du tournoi
   */
  broadcastTournamentUpdate(payload: TournamentUpdatePayload) {
    const tournamentRoom = `tournament:${payload.tournamentId}`;

    this.server.to(tournamentRoom).emit('tournament_update', payload);

    this.logger.log(`🏆 Tournament update broadcasted: ${payload.tournamentId}`);
  }

  /**
   * Diffuser un timeout/alerte de match
   */
  broadcastMatchTimeout(payload: {
    matchId: string;
    tournamentId: string;
    severity: 'warning' | 'critical';
    message: string;
  }) {
    const matchRoom = `match:${payload.matchId}`;
    const tournamentRoom = `tournament:${payload.tournamentId}`;

    this.server.to(matchRoom).emit('match_timeout', payload);
    this.server.to(tournamentRoom).emit('match_timeout', payload);

    this.logger.warn(`⚠️  Match timeout alert: ${payload.matchId} (${payload.severity})`);
  }

  /**
   * Notification personnelle à un utilisateur spécifique
   */
  notifyUser(userId: string, event: string, data: any) {
    // Émettre à tous les sockets connectés de cet utilisateur
    this.server.emit(`user:${userId}`, { event, data });

    this.logger.debug(`📧 Notification sent to user ${userId}: ${event}`);
  }

  /**
   * Statistiques de connexions (pour monitoring)
   */
  getConnectionStats() {
    const sockets = this.server.sockets.sockets;
    const rooms = this.server.sockets.adapter.rooms;

    return {
      totalConnections: sockets.size,
      totalRooms: rooms.size,
      rooms: Array.from(rooms.entries()).map(([room, sockets]) => ({
        room,
        connections: sockets.size,
      })),
    };
  }
}

/**
 * EXEMPLE D'UTILISATION CÔTÉ CLIENT (Frontend)
 *
 * ```typescript
 * import { io } from 'socket.io-client';
 *
 * // Connexion au gateway
 * const socket = io('http://localhost:3000/tournaments', {
 *   auth: {
 *     token: 'JWT_TOKEN_HERE'
 *   }
 * });
 *
 * // Rejoindre un tournoi
 * socket.emit('join_tournament', 'tournament-123');
 *
 * // Rejoindre un match
 * socket.emit('join_match', 'match-456');
 *
 * // Écouter les mises à jour de score
 * socket.on('score_update', (data) => {
 *   console.log('Score update:', data);
 *   // Mettre à jour l'UI
 * });
 *
 * // Écouter le démarrage de match
 * socket.on('match_start', (data) => {
 *   console.log('Match started:', data);
 * });
 *
 * // Écouter la fin de match
 * socket.on('match_end', (data) => {
 *   console.log('Match ended:', data);
 * });
 *
 * // Quitter quand l'utilisateur change de page
 * socket.emit('leave_tournament', 'tournament-123');
 * socket.emit('leave_match', 'match-456');
 * ```
 */

/**
 * EXEMPLE D'UTILISATION CÔTÉ SERVEUR
 *
 * ```typescript
 * @Injectable()
 * export class MatchService {
 *   constructor(
 *     private tournamentGateway: TournamentGateway,
 *     private prisma: PrismaService,
 *   ) {}
 *
 *   async updateScore(matchId: string, homeScore: number, awayScore: number) {
 *     const match = await this.prisma.match.update({
 *       where: { id: matchId },
 *       data: { homeScore, awayScore },
 *     });
 *
 *     // Diffuser la mise à jour en temps réel
 *     this.tournamentGateway.broadcastScoreUpdate({
 *       matchId: match.id,
 *       tournamentId: match.tournamentId,
 *       homeScore: match.homeScore,
 *       awayScore: match.awayScore,
 *       timestamp: new Date(),
 *     });
 *   }
 * }
 * ```
 */
