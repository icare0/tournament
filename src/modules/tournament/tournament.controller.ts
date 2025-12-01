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
import { CreateTournamentDto, UpdateTournamentDto, TournamentFiltersDto, UpdateMatchDto } from './dto/tournament.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Tournaments')
@Controller('tournaments')
export class TournamentController {
  constructor(private readonly tournamentService: TournamentService) {}

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

  @Get(':id/participants')
  @ApiOperation({ summary: 'Get tournament participants' })
  async getParticipants(@Param('id') id: string) {
    return this.tournamentService.getParticipants(id);
  }

  @Get(':id/bracket')
  @ApiOperation({ summary: 'Get tournament bracket' })
  async getBracket(@Param('id') id: string) {
    return this.tournamentService.getBracket(id);
  }

  @Get(':id/matches')
  @ApiOperation({ summary: 'Get tournament matches' })
  async getMatches(@Param('id') id: string) {
    return this.tournamentService.getTournamentMatches(id);
  }
}

@ApiTags('Matches')
@Controller('matches')
export class MatchController {
  constructor(private readonly tournamentService: TournamentService) {}

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
}
