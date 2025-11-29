import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class ParticipantService {
  constructor(private prisma: PrismaService) {}

  // TODO: Implement participant management logic
  // - Register participant (with payment check)
  // - Check-in participant
  // - Withdraw participant (with refund)
  // - Disqualify participant
  // - Update participant seed
  // - Get participant stats
}
