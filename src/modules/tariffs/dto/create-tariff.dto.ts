import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChargePointType, Role } from '@prisma/client';

export class CreateTariffDto {
  @ApiProperty({ example: 'AC Standard' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ enum: ChargePointType, example: ChargePointType.AC })
  @IsOptional()
  @IsEnum(ChargePointType)
  chargePointType?: ChargePointType;

  @ApiPropertyOptional({ enum: Role, example: Role.PARTICULIER })
  @IsOptional()
  @IsEnum(Role)
  targetRole?: Role;

  @ApiProperty({ example: 120, description: 'Prix par kWh en FCFA' })
  @IsNumber()
  pricePerKwh: number;

  @ApiPropertyOptional({ example: 0, description: 'Prix par minute en FCFA' })
  @IsOptional()
  @IsNumber()
  pricePerMinute?: number;

  @ApiPropertyOptional({ example: 1.15, description: 'Multiplicateur heure pleine (ex: 1.15 = +15%)' })
  @IsOptional()
  @IsNumber()
  peakMultiplier?: number;

  @ApiPropertyOptional({ example: 25, description: 'Pénalité d\'occupation par minute (FCFA)' })
  @IsOptional()
  @IsNumber()
  idlePricePerMinute?: number;

  @ApiPropertyOptional({ example: 70, description: 'Part reversée à l\'hôte en %' })
  @IsOptional()
  @IsNumber()
  hostRevenueSharePct?: number;

  @ApiPropertyOptional({ example: 22, description: 'Heure de début heure creuse/pleine (0-23)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(23)
  startHour?: number;

  @ApiPropertyOptional({ example: 6, description: 'Heure de fin heure creuse/pleine (0-23)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(23)
  endHour?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateTariffDto {
  @ApiPropertyOptional({ example: 'AC Standard' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: ChargePointType })
  @IsOptional()
  @IsEnum(ChargePointType)
  chargePointType?: ChargePointType;

  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role)
  targetRole?: Role;

  @ApiPropertyOptional({ example: 125 })
  @IsOptional()
  @IsNumber()
  pricePerKwh?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  pricePerMinute?: number;

  @ApiPropertyOptional({ example: 1.15 })
  @IsOptional()
  @IsNumber()
  peakMultiplier?: number;

  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @IsNumber()
  idlePricePerMinute?: number;

  @ApiPropertyOptional({ example: 70 })
  @IsOptional()
  @IsNumber()
  hostRevenueSharePct?: number;

  @ApiPropertyOptional({ example: 22 })
  @IsOptional()
  @IsNumber()
  startHour?: number;

  @ApiPropertyOptional({ example: 6 })
  @IsOptional()
  @IsNumber()
  endHour?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class SimulateTariffDto {
  @ApiProperty({ example: 35, description: 'Énergie rechargée en kWh' })
  @IsNumber()
  energyKwh: number;

  @ApiPropertyOptional({ enum: ChargePointType, example: ChargePointType.DC })
  @IsOptional()
  @IsEnum(ChargePointType)
  chargePointType?: ChargePointType;

  @ApiPropertyOptional({ example: false, description: 'Heure pleine active ou non' })
  @IsOptional()
  @IsBoolean()
  isPeak?: boolean;
}
