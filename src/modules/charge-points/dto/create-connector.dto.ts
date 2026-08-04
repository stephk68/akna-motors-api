import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ChargePointStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConnectorDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  connectorId: number;

  @ApiPropertyOptional({ example: 'CCS2' })
  @IsOptional()
  @IsString()
  standard?: string;

  @ApiPropertyOptional({ enum: ChargePointStatus, default: ChargePointStatus.AVAILABLE })
  @IsOptional()
  @IsEnum(ChargePointStatus)
  status?: ChargePointStatus;
}

export class UpdateConnectorDto {
  @ApiPropertyOptional({ example: 'CCS2' })
  @IsOptional()
  @IsString()
  standard?: string;

  @ApiPropertyOptional({ enum: ChargePointStatus })
  @IsOptional()
  @IsEnum(ChargePointStatus)
  status?: ChargePointStatus;
}
