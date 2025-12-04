import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { Prisma, TransactionType, TransactionStatus } from '@prisma/client';

export interface CreateTransactionDto {
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  type: TransactionType;
  description?: string;
  referenceId?: string;
  metadata?: any;
}

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  /**
   * DOUBLE-ENTRY ACCOUNTING IMPLEMENTATION
   *
   * Every financial transaction creates TWO entries:
   * 1. DEBIT entry (money leaving an account)
   * 2. CREDIT entry (money entering an account)
   *
   * Example: User A pays 100 USD entry fee to Platform
   * Transaction 1 (DEBIT):  User A's wallet: -100 (entryType: DEBIT)
   * Transaction 2 (CREDIT): Platform wallet: +100 (entryType: CREDIT)
   * Both transactions are linked via counterpartyTransactionId
   *
   * This ensures:
   * - Audit trail (every money movement is tracked)
   * - Balance integrity (sum of all transactions = total balance)
   * - Easy reconciliation
   * - Fraud detection
   */

  /**
   * Create a double-entry transaction
   * @param fromWalletId - Source wallet (DEBIT)
   * @param toWalletId - Destination wallet (CREDIT)
   * @param amount - Amount to transfer
   * @param type - Transaction type
   * @param referenceId - Reference to related entity (tournament, match, etc.)
   */
  async createDoubleEntryTransaction(
    dto: CreateTransactionDto,
  ): Promise<{ debitTx: any; creditTx: any }> {
    const { fromWalletId, toWalletId, amount, type, description, referenceId, metadata } = dto;

    // Validate amount
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    // Fetch both wallets
    const [fromWallet, toWallet] = await Promise.all([
      this.prisma.wallet.findUnique({ where: { id: fromWalletId } }),
      this.prisma.wallet.findUnique({ where: { id: toWalletId } }),
    ]);

    if (!fromWallet) {
      throw new NotFoundException('Source wallet not found');
    }

    if (!toWallet) {
      throw new NotFoundException('Destination wallet not found');
    }

    // Check balance
    const availableBalance = Number(fromWallet.balance);
    if (availableBalance < amount) {
      throw new BadRequestException(
        `Insufficient funds. Available: $${availableBalance}, Required: $${amount}`,
      );
    }

    // Execute transaction in Prisma transaction (atomic)
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Create DEBIT transaction (money leaving)
      const debitTx = await tx.transaction.create({
        data: {
          walletId: fromWalletId,
          type,
          entryType: 'DEBIT',
          amount,
          status: TransactionStatus.PENDING,
          description: description || `Transfer to ${toWallet.userId}`,
          referenceId,
          metadata,
        },
      });

      // 2. Create CREDIT transaction (money entering)
      const creditTx = await tx.transaction.create({
        data: {
          walletId: toWalletId,
          type,
          entryType: 'CREDIT',
          amount,
          status: TransactionStatus.PENDING,
          description: description || `Transfer from ${fromWallet.userId}`,
          referenceId,
          counterpartyTransactionId: debitTx.id, // Link to debit transaction
          metadata,
        },
      });

      // 3. Link debit transaction to credit transaction
      await tx.transaction.update({
        where: { id: debitTx.id },
        data: {
          counterpartyTransactionId: creditTx.id,
        },
      });

      // 4. Update fromWallet balance (deduct)
      const newFromBalance = Number(fromWallet.balance) - amount;
      await tx.wallet.update({
        where: { id: fromWalletId },
        data: {
          balance: newFromBalance,
        },
      });

      // 5. Update toWallet balance (add)
      const newToBalance = Number(toWallet.balance) + amount;
      await tx.wallet.update({
        where: { id: toWalletId },
        data: {
          balance: newToBalance,
        },
      });

      // 6. Update transaction statuses and balanceAfter
      await tx.transaction.update({
        where: { id: debitTx.id },
        data: {
          status: TransactionStatus.COMPLETED,
          balanceAfter: newFromBalance,
        },
      });

      await tx.transaction.update({
        where: { id: creditTx.id },
        data: {
          status: TransactionStatus.COMPLETED,
          balanceAfter: newToBalance,
        },
      });

      return { debitTx, creditTx };
    });

    return result;
  }

  /**
   * Deposit funds to a wallet
   * Creates a CREDIT transaction (money entering the system)
   */
  async deposit(walletId: string, amount: number, method = 'CARD') {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Create CREDIT transaction
      const transaction = await tx.transaction.create({
        data: {
          walletId,
          type: TransactionType.DEPOSIT,
          entryType: 'CREDIT',
          amount,
          status: TransactionStatus.COMPLETED,
          description: `Deposit via ${method}`,
          metadata: {
            method,
            depositedAt: new Date().toISOString(),
          },
        },
      });

      // Update wallet balance
      const newBalance = Number(wallet.balance) + amount;
      await tx.wallet.update({
        where: { id: walletId },
        data: {
          balance: newBalance,
        },
      });

      // Update transaction with balanceAfter
      await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          balanceAfter: newBalance,
        },
      });

      return transaction;
    });

    return {
      success: true,
      transaction: result,
      message: `Successfully deposited $${amount}`,
    };
  }

  /**
   * Withdraw funds from a wallet
   * Creates a DEBIT transaction (money leaving the system)
   */
  async withdraw(walletId: string, amount: number, method = 'BANK') {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const availableBalance = Number(wallet.balance);
    if (availableBalance < amount) {
      throw new BadRequestException(
        `Insufficient funds. Available: $${availableBalance}, Requested: $${amount}`,
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Create DEBIT transaction
      const transaction = await tx.transaction.create({
        data: {
          walletId,
          type: TransactionType.WITHDRAWAL,
          entryType: 'DEBIT',
          amount,
          status: TransactionStatus.COMPLETED,
          description: `Withdrawal to ${method}`,
          metadata: {
            method,
            withdrawnAt: new Date().toISOString(),
          },
        },
      });

      // Update wallet balance
      const newBalance = Number(wallet.balance) - amount;
      await tx.wallet.update({
        where: { id: walletId },
        data: {
          balance: newBalance,
        },
      });

      // Update transaction with balanceAfter
      await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          balanceAfter: newBalance,
        },
      });

      return transaction;
    });

    return {
      success: true,
      transaction: result,
      message: `Successfully withdrawn $${amount}`,
    };
  }

  /**
   * Prize payout - Transfer prize pool to winners
   */
  async distributePrize(
    platformWalletId: string,
    winnerWalletId: string,
    amount: number,
    tournamentId: string,
    placement: number,
  ) {
    return this.createDoubleEntryTransaction({
      fromWalletId: platformWalletId,
      toWalletId: winnerWalletId,
      amount,
      type: TransactionType.PRIZE_PAYOUT,
      description: `Prize payout for #${placement} place`,
      referenceId: tournamentId,
      metadata: {
        placement,
        tournamentId,
        paidAt: new Date().toISOString(),
      },
    });
  }

  /**
   * Tournament entry fee - Transfer from user to platform
   */
  async processTournamentEntry(
    userWalletId: string,
    platformWalletId: string,
    amount: number,
    tournamentId: string,
  ) {
    return this.createDoubleEntryTransaction({
      fromWalletId: userWalletId,
      toWalletId: platformWalletId,
      amount,
      type: TransactionType.TOURNAMENT_ENTRY,
      description: `Tournament entry fee`,
      referenceId: tournamentId,
      metadata: {
        tournamentId,
        paidAt: new Date().toISOString(),
      },
    });
  }

  /**
   * Get transaction history with pagination
   */
  async getTransactionHistory(
    walletId: string,
    filters?: {
      type?: TransactionType;
      status?: TransactionStatus;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    },
  ) {
    const { type, status, startDate, endDate, limit = 50, offset = 0 } = filters || {};

    const where: any = { walletId };

    if (type) where.type = type;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          wallet: {
            include: {
              user: {
                select: { id: true, username: true, avatar: true },
              },
            },
          },
        },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      transactions,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    };
  }

  /**
   * Get transaction by ID with counterparty
   */
  async getTransactionById(transactionId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        wallet: {
          include: {
            user: {
              select: { id: true, username: true, avatar: true },
            },
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // Fetch counterparty transaction if it exists
    let counterpartyTransaction = null;
    if (transaction.counterpartyTransactionId) {
      counterpartyTransaction = await this.prisma.transaction.findUnique({
        where: { id: transaction.counterpartyTransactionId },
        include: {
          wallet: {
            include: {
              user: {
                select: { id: true, username: true, avatar: true },
              },
            },
          },
        },
      });
    }

    return {
      transaction,
      counterpartyTransaction,
    };
  }

  /**
   * Validate transaction integrity (for auditing)
   * Ensures all debits = all credits
   */
  async validateTransactionIntegrity(): Promise<{
    isValid: boolean;
    totalDebits: number;
    totalCredits: number;
    difference: number;
    issues: string[];
  }> {
    const issues: string[] = [];

    // Sum all DEBIT transactions
    const debits = await this.prisma.transaction.aggregate({
      where: {
        entryType: 'DEBIT',
        status: TransactionStatus.COMPLETED,
      },
      _sum: {
        amount: true,
      },
    });

    // Sum all CREDIT transactions
    const credits = await this.prisma.transaction.aggregate({
      where: {
        entryType: 'CREDIT',
        status: TransactionStatus.COMPLETED,
      },
      _sum: {
        amount: true,
      },
    });

    const totalDebits = Number(debits._sum.amount || 0);
    const totalCredits = Number(credits._sum.amount || 0);
    const difference = Math.abs(totalDebits - totalCredits);

    const isValid = difference < 0.01; // Allow for small floating point errors

    if (!isValid) {
      issues.push(
        `Debit/Credit mismatch: Debits = $${totalDebits}, Credits = $${totalCredits}`,
      );
    }

    // Check for orphaned transactions (debit without credit or vice versa)
    const orphanedTransactions = await this.prisma.transaction.findMany({
      where: {
        counterpartyTransactionId: null,
        type: {
          not: TransactionType.DEPOSIT, // Deposits don't have counterparty
        },
        status: TransactionStatus.COMPLETED,
      },
    });

    if (orphanedTransactions.length > 0) {
      issues.push(
        `Found ${orphanedTransactions.length} orphaned transactions (missing counterparty)`,
      );
    }

    // Verify wallet balances match transaction history
    const wallets = await this.prisma.wallet.findMany();

    for (const wallet of wallets) {
      const transactions = await this.prisma.transaction.findMany({
        where: {
          walletId: wallet.id,
          status: TransactionStatus.COMPLETED,
        },
        orderBy: { createdAt: 'asc' },
      });

      let calculatedBalance = 0;
      for (const tx of transactions) {
        if (tx.entryType === 'CREDIT') {
          calculatedBalance += Number(tx.amount);
        } else {
          calculatedBalance -= Number(tx.amount);
        }
      }

      const actualBalance = Number(wallet.balance);
      const balanceDiff = Math.abs(calculatedBalance - actualBalance);

      if (balanceDiff > 0.01) {
        issues.push(
          `Wallet ${wallet.userId}: Balance mismatch. Calculated: $${calculatedBalance}, Actual: $${actualBalance}`,
        );
      }
    }

    return {
      isValid: issues.length === 0,
      totalDebits,
      totalCredits,
      difference,
      issues,
    };
  }

  /**
   * Get financial summary (for admin dashboard)
   */
  async getFinancialSummary(period: 'day' | 'week' | 'month' | 'year' = 'month') {
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const [
      totalDeposits,
      totalWithdrawals,
      totalEntryFees,
      totalPrizesAwarded,
      activeWallets,
      totalLockedFunds,
    ] = await Promise.all([
      // Total deposits
      this.prisma.transaction.aggregate({
        where: {
          type: TransactionType.DEPOSIT,
          status: TransactionStatus.COMPLETED,
          createdAt: { gte: startDate },
        },
        _sum: { amount: true },
      }),
      // Total withdrawals
      this.prisma.transaction.aggregate({
        where: {
          type: TransactionType.WITHDRAWAL,
          status: TransactionStatus.COMPLETED,
          createdAt: { gte: startDate },
        },
        _sum: { amount: true },
      }),
      // Total tournament entries
      this.prisma.transaction.aggregate({
        where: {
          type: TransactionType.TOURNAMENT_ENTRY,
          status: TransactionStatus.COMPLETED,
          createdAt: { gte: startDate },
        },
        _sum: { amount: true },
      }),
      // Total prizes awarded
      this.prisma.transaction.aggregate({
        where: {
          type: TransactionType.PRIZE_PAYOUT,
          status: TransactionStatus.COMPLETED,
          createdAt: { gte: startDate },
        },
        _sum: { amount: true },
      }),
      // Active wallets count
      this.prisma.wallet.count({
        where: { status: 'ACTIVE' },
      }),
      // Total locked funds
      this.prisma.wallet.aggregate({
        _sum: { lockedBalance: true },
      }),
    ]);

    return {
      period,
      deposits: Number(totalDeposits._sum.amount || 0),
      withdrawals: Number(totalWithdrawals._sum.amount || 0),
      entryFees: Number(totalEntryFees._sum.amount || 0),
      prizesAwarded: Number(totalPrizesAwarded._sum.amount || 0),
      netFlow: Number(totalDeposits._sum.amount || 0) - Number(totalWithdrawals._sum.amount || 0),
      platformRevenue: Number(totalEntryFees._sum.amount || 0) - Number(totalPrizesAwarded._sum.amount || 0),
      activeWallets,
      totalLockedFunds: Number(totalLockedFunds._sum.lockedBalance || 0),
    };
  }
}
