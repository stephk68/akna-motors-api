import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ChargePointType, ChargePointStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChargePointDto {
  @ApiProperty({ example: 'CP-ABJ-001' })
  @IsString()
  ocppId: string;

  @ApiProperty({ example: 'Station Plateau Central' })
  @IsString()
  name: string;

  @ApiProperty({ enum: ChargePointType, default: ChargePointType.AC })
  @IsEnum(ChargePointType)
  type: ChargePointType;

  @ApiProperty({ example: 22.0 })
  @IsNumber()
  powerKw: number;

  @ApiPropertyOptional({ enum: ChargePointStatus, default: ChargePointStatus.OFFLINE })
  @IsOptional()
  @IsEnum(ChargePointStatus)
  status?: ChargePointStatus;

  @ApiPropertyOptional({ example: 'host-uuid' })
  @IsOptional()
  @IsString()
  hostId?: string;

  @ApiProperty({ example: 5.3254 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: -4.0205 })
  @IsNumber()
  longitude: number;

  @ApiPropertyOptional({ example: 'Avenue Chardy, Plateau' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'Plateau' })
  @IsOptional()
  @IsString()
  zone?: string;

  @ApiPropertyOptional({ example: 'Abidjan' })
  @IsOptional()
  @IsString()
  city?: string;
}

export class UpdateChargePointDto {
  @ApiPropertyOptional({ example: 'Station Plateau Central' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: ChargePointType })
  @IsOptional()
  @IsEnum(ChargePointType)
  type?: ChargePointType;

  @ApiPropertyOptional({ example: 22.0 })
  @IsOptional()
  @IsNumber()
  powerKw?: number;

  @ApiPropertyOptional({ enum: ChargePointStatus })
  @IsOptional()
  @IsEnum(ChargePointStatus)
  status?: ChargePointStatus;

  @ApiPropertyOptional({ example: 'host-uuid' })
  @IsOptional()
  @IsString()
  hostId?: string;

  @ApiPropertyOptional({ example: 5.3254 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: -4.0205 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ example: 'Avenue Chardy, Plateau' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'Plateau' })
  @IsOptional()
  @IsString()
  zone?: string;

  @ApiPropertyOptional({ example: 'Abidjan' })
  @IsOptional()
  @IsString()
  city?: string;
}
