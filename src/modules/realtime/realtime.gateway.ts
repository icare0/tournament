import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // ============================================
  // ROOM MANAGEMENT
  // ============================================

  @SubscribeMessage('joinTournament')
  handleJoinTournament(client: Socket, tournamentId: string) {
    client.join(`tournament:${tournamentId}`);
    this.logger.log(`Client ${client.id} joined tournament:${tournamentId}`);
    return { success: true, room: `tournament:${tournamentId}` };
  }

  @SubscribeMessage('leaveTournament')
  handleLeaveTournament(client: Socket, tournamentId: string) {
    client.leave(`tournament:${tournamentId}`);
    this.logger.log(`Client ${client.id} left tournament:${tournamentId}`);
    return { success: true };
  }

  @SubscribeMessage('joinMatch')
  handleJoinMatch(client: Socket, matchId: string) {
    client.join(`match:${matchId}`);
    this.logger.log(`Client ${client.id} joined match:${matchId}`);
    return { success: true, room: `match:${matchId}` };
  }

  @SubscribeMessage('leaveMatch')
  handleLeaveMatch(client: Socket, matchId: string) {
    client.leave(`match:${matchId}`);
    this.logger.log(`Client ${client.id} left match:${matchId}`);
    return { success: true };
  }

  // ============================================
  // BROADCAST METHODS (Called from services)
  // ============================================

  /**
   * Broadcast match score update to all subscribers
   */
  broadcastMatchUpdate(matchId: string, data: any) {
    this.server.to(`match:${matchId}`).emit('matchUpdate', data);
    this.logger.debug(`Broadcasting match update for match:${matchId}`);
  }

  /**
   * Broadcast tournament status change
   */
  broadcastTournamentUpdate(tournamentId: string, data: any) {
    this.server.to(`tournament:${tournamentId}`).emit('tournamentUpdate', data);
    this.logger.debug(`Broadcasting tournament update for tournament:${tournamentId}`);
  }

  /**
   * Broadcast leaderboard update
   */
  broadcastLeaderboardUpdate(tournamentId: string, leaderboard: any) {
    this.server.to(`tournament:${tournamentId}`).emit('leaderboardUpdate', leaderboard);
    this.logger.debug(`Broadcasting leaderboard update for tournament:${tournamentId}`);
  }

  /**
   * Broadcast match start notification
   */
  broadcastMatchStart(matchId: string, matchData: any) {
    const tournamentId = matchData.tournamentId;
    this.server.to(`match:${matchId}`).emit('matchStart', matchData);
    this.server.to(`tournament:${tournamentId}`).emit('matchStart', matchData);
    this.logger.log(`Match ${matchId} started`);
  }

  /**
   * Broadcast match completion
   */
  broadcastMatchComplete(matchId: string, matchData: any) {
    const tournamentId = matchData.tournamentId;
    this.server.to(`match:${matchId}`).emit('matchComplete', matchData);
    this.server.to(`tournament:${tournamentId}`).emit('matchComplete', matchData);
    this.logger.log(`Match ${matchId} completed`);
  }

  /**
   * Send notification to specific user
   */
  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }

  /**
   * Broadcast global announcement
   */
  broadcastGlobalAnnouncement(announcement: any) {
    this.server.emit('announcement', announcement);
    this.logger.log('Global announcement sent');
  }
}
