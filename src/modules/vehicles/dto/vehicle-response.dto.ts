import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Véhicule tel que renvoyé par les routes mobiles.
 *
 * Les champs `last*` sont un instantané léger alimenté par le worker
 * d'ingestion télémétrique ; l'historique complet vit dans TimescaleDB.
 */
export class VehicleDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  ownerId: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  organizationId: string | null;

  @ApiPropertyOptional({
    example: '1HGCR2F83HA000000',
    nullable: true,
    description: 'Unique en base : un doublon est rejeté.',
  })
  vin: string | null;

  @ApiPropertyOptional({ example: '2381 JK 01', nullable: true })
  plate: string | null;

  @ApiPropertyOptional({ example: 'BYD', nullable: true })
  make: string | null;

  @ApiPropertyOptional({ example: 'Atto 3', nullable: true })
  model: string | null;

  @ApiPropertyOptional({
    example: 'TELTONIKA-OBD-001',
    nullable: true,
    description: 'N° de série du boîtier. Unique en base.',
  })
  obdSerial: string | null;

  @ApiPropertyOptional({
    example: 78.5,
    nullable: true,
    type: Number,
    description: 'Dernier état de charge connu, en %.',
  })
  lastBatteryPct: number | null;

  @ApiPropertyOptional({ example: 240.7, nullable: true, type: Number })
  lastRangeKm: number | null;

  @ApiPropertyOptional({ example: 5.3364, nullable: true, type: Number })
  lastLatitude: number | null;

  @ApiPropertyOptional({ example: -4.0267, nullable: true, type: Number })
  lastLongitude: number | null;

  @ApiPropertyOptional({ example: 'Plateau', nullable: true })
  lastZone: string | null;

  @ApiPropertyOptional({ example: 41230, nullable: true, type: Number })
  odometerKm: number | null;

  @ApiProperty({ example: 0, description: 'Nombre de codes défaut actifs.' })
  activeDtcCount: number;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  lastSeenAt: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt: string;
}
