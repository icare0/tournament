import { IsString, IsEnum, IsInt, IsOptional, IsISO8601, IsNumber, Min, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TournamentType, TournamentVisibility, TournamentStatus } from '@prisma/client';

export class CreateTournamentDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  game: string;

  @ApiProperty({ enum: TournamentType })
  @IsEnum(TournamentType)
  type: TournamentType;

  @ApiProperty({ enum: TournamentVisibility, required: false })
  @IsOptional()
  @IsEnum(TournamentVisibility)
  visibility?: TournamentVisibility;

  @ApiProperty()
  @IsInt()
  @Min(2)
  maxParticipants: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  entryFee?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  prizePool?: number;

  @ApiProperty()
  @IsISO8601()
  registrationStart: string;

  @ApiProperty()
  @IsISO8601()
  registrationEnd: string;

  @ApiProperty()
  @IsISO8601()
  startDate: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsISO8601()
  endDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  rules?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  prizes?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  banner?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  logo?: string;
}

export class UpdateTournamentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(TournamentStatus)
  status?: TournamentStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(TournamentVisibility)
  visibility?: TournamentVisibility;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  entryFee?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  prizePool?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsISO8601()
  registrationStart?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsISO8601()
  registrationEnd?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsISO8601()
  endDate?: string;
}

export class TournamentFiltersDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  game?: string;

  @ApiProperty({ enum: TournamentType, required: false })
  @IsOptional()
  @IsEnum(TournamentType)
  type?: TournamentType;

  @ApiProperty({ enum: TournamentStatus, required: false })
  @IsOptional()
  @IsEnum(TournamentStatus)
  status?: TournamentStatus;

  @ApiProperty({ enum: TournamentVisibility, required: false })
  @IsOptional()
  @IsEnum(TournamentVisibility)
  visibility?: TournamentVisibility;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

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

export class UpdateMatchDto {
  @ApiProperty({ enum: ['SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED', 'DISPUTED'], required: false })
  @IsOptional()
  @IsEnum(['SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED', 'DISPUTED'])
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  homeScore?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  awayScore?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  winnerId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsISO8601()
  scheduledAt?: string;
}
