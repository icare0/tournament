import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { BillingService } from './billing.service';
import { PrismaService } from '../prisma/prisma.service';

describe('BillingService', () => {
  let service: BillingService;
  let prisma: PrismaService;

  const mockPrismaService = {
    wallet: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    transaction: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockWallet = {
    id: 'wallet1',
    userId: 'user1',
    balance: 100,
    lockedBalance: 20,
    currency: 'USD',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getWallet', () => {
    it('should return user wallet', async () => {
      mockPrismaService.wallet.findUnique.mockResolvedValue(mockWallet);

      const result = await service.getWallet('user1');

      expect(result).toEqual(mockWallet);
      expect(mockPrismaService.wallet.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user1' },
      });
    });

    it('should throw NotFoundException if wallet not found', async () => {
      mockPrismaService.wallet.findUnique.mockResolvedValue(null);

      await expect(service.getWallet('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getBalance', () => {
    it('should return wallet balance', async () => {
      mockPrismaService.wallet.findUnique.mockResolvedValue(mockWallet);

      const result = await service.getBalance('user1');

      expect(result).toEqual({
        balance: 100,
        lockedBalance: 20,
        availableBalance: 80,
        currency: 'USD',
      });
    });
  });

  describe('deposit', () => {
    const depositDto = {
      amount: 50,
      paymentMethod: 'credit_card',
    };

    it('should successfully deposit funds', async () => {
      const newBalance = 150;
      mockPrismaService.wallet.findUnique.mockResolvedValue(mockWallet);
      mockPrismaService.transaction.create.mockResolvedValue({
        id: 'tx1',
        type: 'DEPOSIT',
        amount: 50,
        balanceAfter: newBalance,
      });
      mockPrismaService.wallet.update.mockResolvedValue({
        ...mockWallet,
        balance: newBalance,
      });

      const result = await service.deposit('user1', depositDto);

      expect(result).toHaveProperty('balanceAfter', newBalance);
      expect(mockPrismaService.transaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'DEPOSIT',
            amount: 50,
          }),
        }),
      );
    });
  });

  describe('withdraw', () => {
    const withdrawDto = {
      amount: 50,
      destination: 'bank_account',
    };

    it('should successfully withdraw funds', async () => {
      const newBalance = 50;
      mockPrismaService.wallet.findUnique.mockResolvedValue(mockWallet);
      mockPrismaService.transaction.create.mockResolvedValue({
        id: 'tx1',
        type: 'WITHDRAWAL',
        amount: 50,
        balanceAfter: newBalance,
      });
      mockPrismaService.wallet.update.mockResolvedValue({
        ...mockWallet,
        balance: newBalance,
      });

      const result = await service.withdraw('user1', withdrawDto);

      expect(result).toHaveProperty('balanceAfter', newBalance);
      expect(mockPrismaService.transaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'WITHDRAWAL',
            entryType: 'DEBIT',
            amount: 50,
          }),
        }),
      );
    });

    it('should throw BadRequestException if insufficient balance', async () => {
      const largeWithdrawDto = {
        amount: 200, // More than available (100 - 20 = 80)
        destination: 'bank_account',
      };
      mockPrismaService.wallet.findUnique.mockResolvedValue(mockWallet);

      await expect(service.withdraw('user1', largeWithdrawDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getTransactions', () => {
    it('should return paginated transactions', async () => {
      const mockTransactions = [
        { id: 'tx1', type: 'DEPOSIT', amount: 100 },
        { id: 'tx2', type: 'WITHDRAWAL', amount: 50 },
      ];
      mockPrismaService.transaction.findMany.mockResolvedValue(mockTransactions);
      mockPrismaService.transaction.count.mockResolvedValue(2);

      const result = await service.getTransactions('user1', 1, 20);

      expect(result).toEqual({
        data: mockTransactions,
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
    });
  });
});
