import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { DepositDto, WithdrawDto, TransactionFiltersDto } from './dto/billing.dto';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  async getWallet(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }

  async getBalance(userId: string) {
    const wallet = await this.getWallet(userId);
    
    return {
      balance: wallet.balance.toString(),
      lockedBalance: wallet.lockedBalance.toString(),
    };
  }

  async getTransactions(userId: string, filters: TransactionFiltersDto) {
    const { type, status, startDate, endDate, page = 1, limit = 20 } = filters;
    
    const where: any = { userId };
    
    if (type) where.type = type;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deposit(userId: string, depositDto: DepositDto) {
    const wallet = await this.getWallet(userId);
    
    const newBalance = Number(wallet.balance) + depositDto.amount;

    // Create transaction
    const transaction = await this.prisma.transaction.create({
      data: {
        walletId: wallet.id,
        userId,
        type: 'DEPOSIT',
        entryType: 'CREDIT',
        amount: depositDto.amount,
        status: 'COMPLETED',
        balanceAfter: newBalance,
        description: `Deposit via ${depositDto.paymentMethod}`,
        metadata: depositDto.metadata,
        processedAt: new Date(),
      },
    });

    // Update wallet balance
    await this.prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: newBalance },
    });

    return transaction;
  }

  async withdraw(userId: string, withdrawDto: WithdrawDto) {
    const wallet = await this.getWallet(userId);
    
    const availableBalance = Number(wallet.balance) - Number(wallet.lockedBalance);

    if (withdrawDto.amount > availableBalance) {
      throw new BadRequestException('Insufficient balance');
    }

    const newBalance = Number(wallet.balance) - withdrawDto.amount;

    // Create transaction
    const transaction = await this.prisma.transaction.create({
      data: {
        walletId: wallet.id,
        userId,
        type: 'WITHDRAWAL',
        entryType: 'DEBIT',
        amount: withdrawDto.amount,
        status: 'COMPLETED',
        balanceAfter: newBalance,
        description: `Withdrawal to ${withdrawDto.destination}`,
        metadata: withdrawDto.metadata,
        processedAt: new Date(),
      },
    });

    // Update wallet balance
    await this.prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: newBalance },
    });

    return transaction;
  }
}
