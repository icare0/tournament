import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { TransactionService } from './services/transaction.service';
import { DepositDto, WithdrawDto, TransactionFiltersDto } from './dto/billing.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Billing')
@Controller('billing')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly transactionService: TransactionService,
  ) {}

  @Get('wallet')
  @ApiOperation({ summary: 'Get my wallet' })
  async getWallet(@Request() req) {
    return this.billingService.getWallet(req.user.userId);
  }

  @Get('balance')
  @ApiOperation({ summary: 'Get my balance' })
  async getBalance(@Request() req) {
    return this.billingService.getBalance(req.user.userId);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get transaction history' })
  async getTransactions(
    @Query() filters: TransactionFiltersDto,
    @Request() req,
  ) {
    return this.billingService.getTransactions(req.user.userId, filters);
  }

  @Post('deposit')
  @ApiOperation({ summary: 'Deposit funds' })
  async deposit(@Body() depositDto: DepositDto, @Request() req) {
    return this.billingService.deposit(req.user.userId, depositDto);
  }

  @Post('withdraw')
  @ApiOperation({ summary: 'Withdraw funds' })
  async withdraw(@Body() withdrawDto: WithdrawDto, @Request() req) {
    return this.billingService.withdraw(req.user.userId, withdrawDto);
  }

  // ============================================
  // TRANSACTION ENDPOINTS
  // ============================================

  @Get('transactions/:id')
  @ApiOperation({ summary: 'Get transaction by ID with counterparty' })
  async getTransactionById(@Param('id') transactionId: string) {
    return this.transactionService.getTransactionById(transactionId);
  }

  @Get('transactions/history/:walletId')
  @ApiOperation({ summary: 'Get transaction history for wallet' })
  async getTransactionHistory(
    @Param('walletId') walletId: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.transactionService.getTransactionHistory(walletId, {
      type: type as any,
      status: status as any,
      limit: limit ? Number(limit) : 50,
      offset: offset ? Number(offset) : 0,
    });
  }

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================

  @Get('admin/financial-summary')
  @ApiOperation({
    summary: 'Get financial summary (admin only)',
    description: 'Returns deposits, withdrawals, entry fees, prizes, revenue metrics'
  })
  async getFinancialSummary(
    @Query('period') period: 'day' | 'week' | 'month' | 'year' = 'month',
  ) {
    return this.transactionService.getFinancialSummary(period);
  }

  @Get('admin/validate-integrity')
  @ApiOperation({
    summary: 'Validate transaction integrity (admin only)',
    description: 'Ensures all debits equal credits, validates wallet balances'
  })
  async validateTransactionIntegrity() {
    return this.transactionService.validateTransactionIntegrity();
  }
}
