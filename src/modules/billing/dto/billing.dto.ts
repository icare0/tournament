import { IsNumber, IsString, IsOptional, IsEnum, Min, IsISO8601, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DepositDto {
  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty()
  @IsString()
  paymentMethod: string;

  @ApiProperty({ required: false })
  @IsOptional()
  metadata?: any;
}

export class WithdrawDto {
  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty()
  @IsString()
  method: string;

  @ApiProperty()
  @IsString()
  destination: string;

  @ApiProperty({ required: false })
  @IsOptional()
  metadata?: any;
}

export class TransactionFiltersDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(['DEPOSIT', 'WITHDRAWAL', 'TOURNAMENT_ENTRY', 'PRIZE_PAYOUT', 'REFUND', 'FEE', 'TRANSFER'])
  type?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(['PENDING', 'COMPLETED', 'FAILED', 'REVERSED'])
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsISO8601()
  endDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
