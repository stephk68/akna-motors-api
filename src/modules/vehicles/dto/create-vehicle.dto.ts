import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVehicleDto {
  @ApiPropertyOptional({ example: '1HGCR2F83HA000000' })
  @IsOptional()
  @IsString()
  vin?: string;

  @ApiPropertyOptional({ example: '2381 JK 01' })
  @IsOptional()
  @IsString()
  plate?: string;

  @ApiPropertyOptional({ example: 'BYD' })
  @IsOptional()
  @IsString()
  make?: string;

  @ApiPropertyOptional({ example: 'Atto 3' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ example: 'TELTONIKA-OBD-001' })
  @IsOptional()
  @IsString()
  obdSerial?: string;

  @ApiPropertyOptional({ example: 'user-uuid' })
  @IsOptional()
  @IsString()
  ownerId?: string;
}

export class UpdateVehicleDto {
  @ApiPropertyOptional({ example: '1HGCR2F83HA000000' })
  @IsOptional()
  @IsString()
  vin?: string;

  @ApiPropertyOptional({ example: '2381 JK 01' })
  @IsOptional()
  @IsString()
  plate?: string;

  @ApiPropertyOptional({ example: 'BYD' })
  @IsOptional()
  @IsString()
  make?: string;

  @ApiPropertyOptional({ example: 'Atto 3' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ example: 'TELTONIKA-OBD-001' })
  @IsOptional()
  @IsString()
  obdSerial?: string;
}
