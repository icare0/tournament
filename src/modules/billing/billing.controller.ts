import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BillingService } from './billing.service';

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // TODO: Implement billing endpoints
  // GET  /billing/wallet - Get my wallet
  // POST /billing/deposit - Deposit funds
  // POST /billing/withdraw - Withdraw funds
  // GET  /billing/transactions - Get transaction history
  // GET  /billing/balance - Get current balance
}
