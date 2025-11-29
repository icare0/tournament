import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { WalletService } from './services/wallet.service';
import { TransactionService } from './services/transaction.service';

@Module({
  controllers: [BillingController],
  providers: [BillingService, WalletService, TransactionService],
  exports: [BillingService, WalletService, TransactionService],
})
export class BillingModule {}
