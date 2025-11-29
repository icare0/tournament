import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { WalletService } from './services/wallet.service';
import { TransactionService } from './services/transaction.service';

@Injectable()
export class BillingService {
  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
    private transactionService: TransactionService,
  ) {}

  // TODO: Implement high-level billing orchestration
  // - Tournament entry fee processing (lock funds in wallet)
  // - Prize pool calculation and distribution
  // - Platform fee calculation
  // - Refund processing
  // - Payment reconciliation
}
