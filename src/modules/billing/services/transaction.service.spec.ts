import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { PrismaService } from '@/common/prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('TransactionService', () => {
  let service: TransactionService;
  let prisma: PrismaService;

  const mockPrismaService = {
    transaction: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    wallet: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockWallet = {
    id: 'wallet-1',
    userId: 'user-1',
    balance: 1000,
    lockedBalance: 0,
  };

  const mockTransaction = {
    id: 'tx-1',
    walletId: 'wallet-1',
    userId: 'user-1',
    type: 'DEPOSIT',
    entryType: 'CREDIT',
    amount: 100,
    status: 'COMPLETED',
    balanceAfter: 1100,
    description: 'Test deposit',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('createDoubleEntryTransaction', () => {
    it('should create a double-entry transaction with debit and credit', async () => {
      const dto = {
        fromWalletId: 'wallet-1',
        toWalletId: 'wallet-2',
        amount: 50,
        type: 'TRANSFER',
        description: 'Test transfer',
      };

      const debitTx = {
        id: 'tx-debit',
        walletId: 'wallet-1',
        entryType: 'DEBIT',
        amount: 50,
        counterpartyTransactionId: 'tx-credit',
      };

      const creditTx = {
        id: 'tx-credit',
        walletId: 'wallet-2',
        entryType: 'CREDIT',
        amount: 50,
        counterpartyTransactionId: 'tx-debit',
      };

      mockPrismaService.wallet.findUnique
        .mockResolvedValueOnce({ ...mockWallet, balance: 100 })
        .mockResolvedValueOnce({ ...mockWallet, id: 'wallet-2', balance: 50 });

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });

      mockPrismaService.transaction.create
        .mockResolvedValueOnce(debitTx)
        .mockResolvedValueOnce(creditTx);

      const result = await service.createDoubleEntryTransaction(dto);

      expect(result).toEqual({
        debitTransaction: debitTx,
        creditTransaction: creditTx,
      });

      expect(mockPrismaService.transaction.create).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.wallet.update).toHaveBeenCalledTimes(2);
    });

    it('should throw error if from wallet not found', async () => {
      mockPrismaService.wallet.findUnique.mockResolvedValue(null);

      await expect(
        service.createDoubleEntryTransaction({
          fromWalletId: 'invalid',
          toWalletId: 'wallet-2',
          amount: 50,
          type: 'TRANSFER',
          description: 'Test',
        })
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error if insufficient balance', async () => {
      mockPrismaService.wallet.findUnique
        .mockResolvedValueOnce({ ...mockWallet, balance: 10 }) // Insufficient
        .mockResolvedValueOnce({ ...mockWallet, id: 'wallet-2' });

      await expect(
        service.createDoubleEntryTransaction({
          fromWalletId: 'wallet-1',
          toWalletId: 'wallet-2',
          amount: 50,
          type: 'TRANSFER',
          description: 'Test',
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should ensure debit and credit amounts match', async () => {
      const dto = {
        fromWalletId: 'wallet-1',
        toWalletId: 'wallet-2',
        amount: 100,
        type: 'TRANSFER',
        description: 'Test',
      };

      mockPrismaService.wallet.findUnique
        .mockResolvedValueOnce({ ...mockWallet, balance: 200 })
        .mockResolvedValueOnce({ ...mockWallet, id: 'wallet-2' });

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });

      let debitAmount: number;
      let creditAmount: number;

      mockPrismaService.transaction.create.mockImplementation((args) => {
        if (args.data.entryType === 'DEBIT') {
          debitAmount = args.data.amount;
          return Promise.resolve({ ...args.data, id: 'tx-debit' });
        } else {
          creditAmount = args.data.amount;
          return Promise.resolve({ ...args.data, id: 'tx-credit' });
        }
      });

      await service.createDoubleEntryTransaction(dto);

      expect(debitAmount).toBe(creditAmount);
    });
  });

  describe('deposit', () => {
    it('should create a deposit transaction with credit entry', async () => {
      mockPrismaService.wallet.findUnique.mockResolvedValue(mockWallet);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });
      mockPrismaService.transaction.create.mockResolvedValue(mockTransaction);

      const result = await service.deposit('wallet-1', 100, 'stripe');

      expect(result.entryType).toBe('CREDIT');
      expect(result.amount).toBe(100);
      expect(mockPrismaService.wallet.update).toHaveBeenCalledWith({
        where: { id: 'wallet-1' },
        data: { balance: 1100 },
      });
    });
  });

  describe('withdraw', () => {
    it('should create a withdrawal transaction with debit entry', async () => {
      mockPrismaService.wallet.findUnique.mockResolvedValue(mockWallet);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });
      mockPrismaService.transaction.create.mockResolvedValue({
        ...mockTransaction,
        type: 'WITHDRAWAL',
        entryType: 'DEBIT',
      });

      const result = await service.withdraw('wallet-1', 50, 'bank_account');

      expect(result.entryType).toBe('DEBIT');
      expect(result.amount).toBe(50);
      expect(mockPrismaService.wallet.update).toHaveBeenCalledWith({
        where: { id: 'wallet-1' },
        data: { balance: 950 },
      });
    });

    it('should throw error if insufficient balance', async () => {
      mockPrismaService.wallet.findUnique.mockResolvedValue({
        ...mockWallet,
        balance: 30,
      });

      await expect(
        service.withdraw('wallet-1', 50, 'bank_account')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('distributePrize', () => {
    it('should distribute prize from platform to winner', async () => {
      const platformWallet = { ...mockWallet, id: 'platform-wallet', balance: 10000 };
      const winnerWallet = { ...mockWallet, id: 'winner-wallet', balance: 500 };

      mockPrismaService.wallet.findUnique
        .mockResolvedValueOnce(platformWallet)
        .mockResolvedValueOnce(winnerWallet);

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });

      mockPrismaService.transaction.create
        .mockResolvedValueOnce({ id: 'tx-debit', entryType: 'DEBIT' })
        .mockResolvedValueOnce({ id: 'tx-credit', entryType: 'CREDIT' });

      const result = await service.distributePrize(
        'platform-wallet',
        'winner-wallet',
        1000,
        'tournament-1',
        1
      );

      expect(result.debitTransaction.entryType).toBe('DEBIT');
      expect(result.creditTransaction.entryType).toBe('CREDIT');
      expect(mockPrismaService.transaction.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('validateTransactionIntegrity', () => {
    it('should validate that total debits equal total credits', async () => {
      mockPrismaService.transaction.aggregate
        .mockResolvedValueOnce({ _sum: { amount: 50000 } }) // Total debits
        .mockResolvedValueOnce({ _sum: { amount: 50000 } }); // Total credits

      mockPrismaService.transaction.findMany
        .mockResolvedValueOnce([]) // No orphaned transactions
        .mockResolvedValueOnce([]); // No orphaned transactions

      mockPrismaService.wallet.findMany.mockResolvedValue([
        {
          id: 'wallet-1',
          balance: 1000,
          transactions: [
            { amount: 500, entryType: 'CREDIT' },
            { amount: 300, entryType: 'CREDIT' },
            { amount: 200, entryType: 'CREDIT' },
          ],
        },
      ]);

      const result = await service.validateTransactionIntegrity();

      expect(result.isValid).toBe(true);
      expect(result.totalDebits).toBe(50000);
      expect(result.totalCredits).toBe(50000);
      expect(result.difference).toBe(0);
      expect(result.issues).toHaveLength(0);
    });

    it('should detect imbalance between debits and credits', async () => {
      mockPrismaService.transaction.aggregate
        .mockResolvedValueOnce({ _sum: { amount: 50000 } }) // Total debits
        .mockResolvedValueOnce({ _sum: { amount: 48000 } }); // Total credits (imbalanced)

      mockPrismaService.transaction.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      mockPrismaService.wallet.findMany.mockResolvedValue([]);

      const result = await service.validateTransactionIntegrity();

      expect(result.isValid).toBe(false);
      expect(result.difference).toBe(2000);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should detect orphaned transactions', async () => {
      mockPrismaService.transaction.aggregate
        .mockResolvedValueOnce({ _sum: { amount: 50000 } })
        .mockResolvedValueOnce({ _sum: { amount: 50000 } });

      // Mock orphaned transactions
      mockPrismaService.transaction.findMany
        .mockResolvedValueOnce([
          { id: 'orphan-1', counterpartyTransactionId: 'missing-tx' },
        ])
        .mockResolvedValueOnce([]);

      mockPrismaService.wallet.findMany.mockResolvedValue([]);

      const result = await service.validateTransactionIntegrity();

      expect(result.isValid).toBe(false);
      expect(result.orphanedTransactions).toHaveLength(1);
    });

    it('should detect wallet balance mismatches', async () => {
      mockPrismaService.transaction.aggregate
        .mockResolvedValueOnce({ _sum: { amount: 50000 } })
        .mockResolvedValueOnce({ _sum: { amount: 50000 } });

      mockPrismaService.transaction.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      mockPrismaService.wallet.findMany.mockResolvedValue([
        {
          id: 'wallet-1',
          balance: 1000, // Reported balance
          transactions: [
            { amount: 500, entryType: 'CREDIT' },
            { amount: 200, entryType: 'DEBIT' },
          ], // Actual should be 300
        },
      ]);

      const result = await service.validateTransactionIntegrity();

      expect(result.isValid).toBe(false);
      expect(result.walletMismatches.length).toBeGreaterThan(0);
    });
  });

  describe('getFinancialSummary', () => {
    it('should return financial summary for a period', async () => {
      const now = new Date();
      const periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      mockPrismaService.transaction.aggregate.mockResolvedValue({
        _sum: { amount: 15000 },
      });

      mockPrismaService.transaction.findMany.mockResolvedValue([
        { amount: 1000, createdAt: now },
        { amount: 2000, createdAt: now },
      ]);

      const result = await service.getFinancialSummary('month');

      expect(result).toHaveProperty('period', 'month');
      expect(result).toHaveProperty('deposits');
      expect(result).toHaveProperty('withdrawals');
      expect(result).toHaveProperty('entryFees');
      expect(result).toHaveProperty('prizesAwarded');
      expect(result).toHaveProperty('netFlow');
    });
  });

  describe('getTransactionHistory', () => {
    it('should return paginated transaction history', async () => {
      const transactions = [
        { ...mockTransaction, id: 'tx-1' },
        { ...mockTransaction, id: 'tx-2' },
      ];

      mockPrismaService.transaction.findMany.mockResolvedValue(transactions);
      mockPrismaService.transaction.count.mockResolvedValue(2);

      const result = await service.getTransactionHistory('wallet-1', {
        limit: 50,
        offset: 0,
      });

      expect(result.transactions).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should filter by transaction type', async () => {
      mockPrismaService.transaction.findMany.mockResolvedValue([mockTransaction]);
      mockPrismaService.transaction.count.mockResolvedValue(1);

      const result = await service.getTransactionHistory('wallet-1', {
        type: 'DEPOSIT',
        limit: 50,
        offset: 0,
      });

      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: 'DEPOSIT',
          }),
        })
      );
    });
  });
});
