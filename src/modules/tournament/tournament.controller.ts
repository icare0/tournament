import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TournamentService } from './tournament.service';
import { ParticipantService } from './services/participant.service';
import { MatchService } from './services/match.service';
import { CreateTournamentDto, UpdateTournamentDto, TournamentFiltersDto, UpdateMatchDto } from './dto/tournament.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Tournaments')
@Controller('tournaments')
export class TournamentController {
  constructor(
    private readonly tournamentService: TournamentService,
    private readonly participantService: ParticipantService,
    private readonly matchService: MatchService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all tournaments' })
  async findAll(@Query() filters: TournamentFiltersDto) {
    return this.tournamentService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tournament by ID' })
  async findOne(@Param('id') id: string) {
    return this.tournamentService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new tournament' })
  async create(@Body() createDto: CreateTournamentDto, @Request() req) {
    return this.tournamentService.create(createDto, req.user.userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update tournament' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTournamentDto,
    @Request() req,
  ) {
    return this.tournamentService.update(id, updateDto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete tournament' })
  async delete(@Param('id') id: string, @Request() req) {
    return this.tournamentService.delete(id, req.user.userId);
  }

  // ============================================
  // PARTICIPANT ENDPOINTS
  // ============================================

  @Get(':id/participants')
  @ApiOperation({ summary: 'Get tournament participants' })
  async getParticipants(@Param('id') id: string) {
    return this.tournamentService.getParticipants(id);
  }

  @Post(':id/register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register for tournament' })
  async registerParticipant(
    @Param('id') tournamentId: string,
    @Body() body: { teamName?: string; teamMembers?: any[] },
    @Request() req,
  ) {
    return this.participantService.registerParticipant({
      tournamentId,
      userId: req.user.userId,
      teamName: body.teamName,
      teamMembers: body.teamMembers,
    });
  }

  @Post(':id/participants/:participantId/check-in')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check-in participant' })
  async checkInParticipant(
    @Param('participantId') participantId: string,
    @Request() req,
  ) {
    return this.participantService.checkInParticipant({
      participantId,
      userId: req.user.userId,
    });
  }

  @Post(':id/participants/:participantId/withdraw')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Withdraw from tournament' })
  async withdrawParticipant(
    @Param('participantId') participantId: string,
    @Request() req,
  ) {
    return this.participantService.withdrawParticipant(
      participantId,
      req.user.userId,
    );
  }

  @Post(':id/participants/:participantId/disqualify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disqualify participant (organizer/referee only)' })
  async disqualifyParticipant(
    @Param('participantId') participantId: string,
    @Body() body: { reason: string },
    @Request() req,
  ) {
    return this.participantService.disqualifyParticipant(
      participantId,
      body.reason,
      req.user.userId,
    );
  }

  @Patch(':id/participants/:participantId/seed')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update participant seed (organizer only)' })
  async updateParticipantSeed(
    @Param('participantId') participantId: string,
    @Body() body: { seed: number },
  ) {
    return this.participantService.updateSeed({
      participantId,
      seed: body.seed,
    });
  }

  @Get(':id/participants/:participantId/stats')
  @ApiOperation({ summary: 'Get participant stats' })
  async getParticipantStats(@Param('participantId') participantId: string) {
    return this.participantService.getParticipantStats(participantId);
  }

  @Post(':id/participants/auto-seed')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Auto-seed participants (organizer only)' })
  async autoSeedParticipants(
    @Param('id') tournamentId: string,
    @Body() body: { method?: 'random' | 'skill' },
  ) {
    return this.participantService.autoSeedParticipants(
      tournamentId,
      body.method || 'random',
    );
  }

  // ============================================
  // BRACKET & MATCH ENDPOINTS
  // ============================================

  @Get(':id/bracket')
  @ApiOperation({ summary: 'Get tournament bracket' })
  async getBracket(@Param('id') id: string) {
    return this.tournamentService.getBracket(id);
  }

  @Post(':id/bracket/generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate bracket (organizer only)' })
  async generateBracket(@Param('id') tournamentId: string) {
    return this.matchService.generateBracket(tournamentId);
  }

  @Get(':id/matches')
  @ApiOperation({ summary: 'Get tournament matches' })
  async getMatches(@Param('id') id: string) {
    return this.tournamentService.getTournamentMatches(id);
  }

  @Post(':id/start')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start tournament (organizer only)' })
  async startTournament(@Param('id') tournamentId: string, @Request() req) {
    // Update tournament status to IN_PROGRESS
    return this.tournamentService.update(
      tournamentId,
      { status: 'IN_PROGRESS' as any },
      req.user.userId,
    );
  }
}

@ApiTags('Matches')
@Controller('matches')
export class MatchController {
  constructor(
    private readonly tournamentService: TournamentService,
    private readonly matchService: MatchService,
  ) {}

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update match' })
  async updateMatch(
    @Param('id') id: string,
    @Body() updateDto: UpdateMatchDto,
  ) {
    return this.tournamentService.updateMatch(id, updateDto);
  }

  @Patch(':id/score')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update match score' })
  async updateScore(
    @Param('id') matchId: string,
    @Body() body: { homeScore: number; awayScore: number; winnerId?: string },
  ) {
    return this.matchService.updateMatchScore({
      matchId,
      homeScore: body.homeScore,
      awayScore: body.awayScore,
      winnerId: body.winnerId,
    });
  }

  @Post(':id/start')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start match' })
  async startMatch(@Param('id') matchId: string) {
    return this.matchService.startMatch(matchId);
  }
}
