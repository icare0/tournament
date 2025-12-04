import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { TransactionService } from './services/transaction.service';
import { BillingController } from './billing.controller';

@Module({
  controllers: [BillingController],
  providers: [BillingService, TransactionService],
  exports: [BillingService, TransactionService],
})
export class BillingModule {}
