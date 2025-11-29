import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TournamentService } from './tournament.service';

@ApiTags('Tournaments')
@Controller('tournaments')
export class TournamentController {
  constructor(private readonly tournamentService: TournamentService) {}

  // TODO: Implement tournament endpoints
  // POST   /tournaments - Create tournament
  // GET    /tournaments - List tournaments (with filters)
  // GET    /tournaments/:id - Get tournament details
  // PATCH  /tournaments/:id - Update tournament
  // DELETE /tournaments/:id - Delete tournament
  // POST   /tournaments/:id/start - Start tournament
  // POST   /tournaments/:id/register - Register participant
  // GET    /tournaments/:id/bracket - Get tournament bracket
}
