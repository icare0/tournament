import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class RealtimeGateway {
  @WebSocketServer()
  server: Server;

  // TODO: Implement WebSocket event handlers
  // - Match score updates (real-time)
  // - Tournament status changes
  // - User notifications
  // - Live leaderboard updates
  // - Chat/messaging (optional)

  @SubscribeMessage('joinTournament')
  handleJoinTournament(client: any, tournamentId: string) {
    client.join(`tournament:${tournamentId}`);
  }

  @SubscribeMessage('joinMatch')
  handleJoinMatch(client: any, matchId: string) {
    client.join(`match:${matchId}`);
  }

  // Broadcast match update to all subscribers
  broadcastMatchUpdate(matchId: string, data: any) {
    this.server.to(`match:${matchId}`).emit('matchUpdate', data);
  }

  // Broadcast tournament update
  broadcastTournamentUpdate(tournamentId: string, data: any) {
    this.server.to(`tournament:${tournamentId}`).emit('tournamentUpdate', data);
  }
}
