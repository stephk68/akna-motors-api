import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentProvider, PaymentStatus } from '@prisma/client';

export class CreatePaymentDto {
  @ApiProperty({ example: 'user-uuid' })
  @IsString()
  userId: string;

  @ApiPropertyOptional({ example: 'session-uuid' })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiProperty({ enum: PaymentProvider, example: PaymentProvider.ORANGE_MONEY })
  @IsEnum(PaymentProvider)
  provider: PaymentProvider;

  @ApiProperty({ example: 4500, description: 'Montant en FCFA' })
  @IsNumber()
  amountFcfa: number;

  @ApiPropertyOptional({ enum: PaymentStatus, default: PaymentStatus.CONFIRMED })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiPropertyOptional({ example: 'OM-2026-98124' })
  @IsOptional()
  @IsString()
  providerRef?: string;
}

export class UpdatePaymentDto {
  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiPropertyOptional({ example: 'REF-88412' })
  @IsOptional()
  @IsString()
  providerRef?: string;
}
