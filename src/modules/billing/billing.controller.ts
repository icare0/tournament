import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { DepositDto, WithdrawDto, TransactionFiltersDto } from './dto/billing.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Billing')
@Controller('billing')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

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
}
