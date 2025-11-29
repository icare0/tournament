import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RefereeService } from './referee.service';

@ApiTags('Referees')
@Controller('referees')
export class RefereeController {
  constructor(private readonly refereeService: RefereeService) {}

  // TODO: Implement referee endpoints
  // POST   /tournaments/:id/referees - Assign referee to tournament
  // DELETE /tournaments/:id/referees/:userId - Remove referee
  // GET    /referees/assigned - Get my assigned tournaments (referee view)
  // POST   /matches/:id/report - Report match result (referee only)
  // POST   /matches/:id/dispute - Handle dispute (referee only)
}
