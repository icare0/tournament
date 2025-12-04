import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RefereeService } from './referee.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Referees')
@Controller('referees')
export class RefereeController {
  constructor(private readonly refereeService: RefereeService) {}

  @Post('tournaments/:tournamentId/assign')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign referee to tournament (organizer only)' })
  async assignReferee(
    @Param('tournamentId') tournamentId: string,
    @Body() body: { refereeId: string },
    @Request() req,
  ) {
    return this.refereeService.assignReferee(
      {
        tournamentId,
        refereeId: body.refereeId,
      },
      req.user.userId,
    );
  }

  @Delete('tournaments/:tournamentId/referees/:refereeId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove referee from tournament (organizer only)' })
  async removeReferee(
    @Param('tournamentId') tournamentId: string,
    @Param('refereeId') refereeId: string,
    @Request() req,
  ) {
    return this.refereeService.removeReferee(
      tournamentId,
      refereeId,
      req.user.userId,
    );
  }

  @Get('assigned')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get tournaments assigned to referee' })
  async getAssignedTournaments(@Request() req) {
    return this.refereeService.getAssignedTournaments(req.user.userId);
  }

  @Post('matches/:matchId/report')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Report match result (referee only)' })
  async reportMatchResult(
    @Param('matchId') matchId: string,
    @Body()
    body: {
      homeScore: number;
      awayScore: number;
      winnerId: string;
      notes?: string;
      matchData?: any;
    },
    @Request() req,
  ) {
    return this.refereeService.reportMatchResult(
      {
        matchId,
        homeScore: body.homeScore,
        awayScore: body.awayScore,
        winnerId: body.winnerId,
        notes: body.notes,
        matchData: body.matchData,
      },
      req.user.userId,
    );
  }

  @Post('matches/:matchId/dispute')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create dispute for match' })
  async createDispute(
    @Param('matchId') matchId: string,
    @Body() body: { reason: string },
    @Request() req,
  ) {
    return this.refereeService.createDispute(
      matchId,
      body.reason,
      req.user.userId,
    );
  }

  @Post('matches/:matchId/dispute/resolve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resolve dispute (referee only)' })
  async resolveDispute(
    @Param('matchId') matchId: string,
    @Body() body: { resolution: 'approve' | 'reject' | 'replay'; notes?: string },
    @Request() req,
  ) {
    return this.refereeService.resolveDispute(
      matchId,
      body.resolution,
      req.user.userId,
      body.notes,
    );
  }

  @Get('matches/attention')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get matches needing attention (disputed, live)' })
  async getMatchesNeedingAttention(@Request() req) {
    return this.refereeService.getMatchesNeedingAttention(req.user.userId);
  }
}
