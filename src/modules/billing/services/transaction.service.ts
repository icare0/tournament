import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  // TODO: Implement DOUBLE-ENTRY transaction logic
  //
  // Double-Entry Accounting Explanation:
  // Every financial transaction creates TWO entries:
  // 1. DEBIT entry (money leaving an account)
  // 2. CREDIT entry (money entering an account)
  //
  // Example: User A pays 100 USD entry fee
  // Transaction 1 (DEBIT):  User A's wallet: -100 (entryType: DEBIT)
  // Transaction 2 (CREDIT): Platform wallet: +100 (entryType: CREDIT)
  // Both transactions are linked via counterpartyTransactionId
  //
  // This ensures:
  // - Audit trail (every money movement is tracked)
  // - Balance integrity (sum of all transactions = total balance)
  // - Easy reconciliation
  // - Fraud detection

  /**
   * Create a double-entry transaction
   * @param fromWalletId - Source wallet
   * @param toWalletId - Destination wallet
   * @param amount - Amount to transfer
   * @param type - Transaction type
   * @param referenceId - Reference to related entity (tournament, match, etc.)
   */
  async createDoubleEntryTransaction(
    fromWalletId: string,
    toWalletId: string,
    amount: number,
    type: string,
    referenceId?: string,
  ) {
    // TODO: Implement double-entry transaction creation
    // 1. Create DEBIT transaction (from wallet)
    // 2. Create CREDIT transaction (to wallet)
    // 3. Link them via counterpartyTransactionId
    // 4. Update wallet balances
    // 5. Wrap in Prisma transaction for atomicity
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(walletId: string, limit = 50) {
    return this.prisma.transaction.findMany({
      where: { walletId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Validate transaction integrity (for auditing)
   * Ensures all debits = all credits
   */
  async validateTransactionIntegrity() {
    // TODO: Implement validation logic
    // Sum all DEBIT transactions
    // Sum all CREDIT transactions
    // They should be equal
  }
}
