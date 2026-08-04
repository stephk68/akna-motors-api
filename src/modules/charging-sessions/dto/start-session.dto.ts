import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StartSessionDto {
  @ApiProperty({ example: 'charge-point-uuid' })
  @IsString()
  chargePointId: string;

  @ApiPropertyOptional({ example: 'connector-uuid' })
  @IsOptional()
  @IsString()
  connectorId?: string;

  @ApiPropertyOptional({ example: 'vehicle-uuid' })
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @ApiPropertyOptional({ example: 'payment-method-uuid' })
  @IsOptional()
  @IsString()
  paymentMethodId?: string;
}
