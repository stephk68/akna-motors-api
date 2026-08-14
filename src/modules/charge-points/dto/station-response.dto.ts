import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChargePointStatus, ChargePointType, Role } from '@prisma/client';

/** Connecteur d'une borne, tel que renvoyé dans le détail d'une station. */
export class ConnectorDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  chargePointId: string;

  @ApiProperty({ example: 1, description: 'N° du connecteur sur la borne (OCPP).' })
  connectorId: number;

  @ApiPropertyOptional({
    example: 'Type2',
    nullable: true,
    description: 'Type2, CCS2, CHAdeMO…',
  })
  standard: string | null;

  @ApiProperty({
    enum: ChargePointStatus,
    description: 'En OCPP le statut est porté par le connecteur, pas par la borne.',
  })
  status: ChargePointStatus;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt: string;
}

/** Règle tarifaire applicable, jointe au détail d'une station. */
export class ApplicableTariffDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'AC Standard' })
  name: string;

  @ApiPropertyOptional({
    enum: ChargePointType,
    nullable: true,
    description: 'null = s’applique à tous les types de borne.',
  })
  chargePointType: ChargePointType | null;

  @ApiPropertyOptional({
    enum: Role,
    nullable: true,
    description: 'null = s’applique à tous les profils.',
  })
  targetRole: Role | null;

  @ApiProperty({ example: 180, description: 'FCFA par kWh.' })
  pricePerKwh: number;

  @ApiPropertyOptional({ example: 25, nullable: true, type: Number })
  pricePerMinute: number | null;

  @ApiPropertyOptional({ example: 1.3, nullable: true, type: Number })
  peakMultiplier: number | null;

  @ApiPropertyOptional({ example: 50, nullable: true, type: Number })
  idlePricePerMinute: number | null;

  @ApiPropertyOptional({ example: 70, nullable: true, type: Number })
  hostRevenueSharePct: number | null;

  @ApiPropertyOptional({
    example: 18,
    nullable: true,
    type: Number,
    description: 'Plage horaire 0-23. null = applicable en permanence.',
  })
  startHour: number | null;

  @ApiPropertyOptional({ example: 22, nullable: true, type: Number })
  endHour: number | null;

  @ApiProperty({ example: true })
  active: boolean;
}

/**
 * Station telle que renvoyée par la liste et par /nearby.
 *
 * Projection volontairement réduite : ce n'est pas l'entité ChargePoint
 * complète. `freeConnectors` et `distanceKm` sont calculés à la volée.
 */
export class StationListItemDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'AKNA-PLATEAU-01' })
  ocppId: string;

  @ApiProperty({ example: 'Station Plateau Central' })
  name: string;

  @ApiPropertyOptional({ example: 'Bd de la République', nullable: true })
  address: string | null;

  @ApiProperty({ enum: ChargePointType })
  type: ChargePointType;

  @ApiProperty({ example: 22, description: 'Puissance nominale en kW.' })
  powerKw: number;

  @ApiProperty({ enum: ChargePointStatus })
  status: ChargePointStatus;

  @ApiProperty({ example: 2, description: 'Connecteurs au statut AVAILABLE.' })
  freeConnectors: number;

  @ApiProperty({ example: 4 })
  totalConnectors: number;

  @ApiProperty({
    example: 3.4,
    nullable: true,
    type: Number,
    description:
      'Distance approximative en km. null si lat/lng ne sont pas fournis en query.',
  })
  distanceKm: number | null;

  @ApiProperty({ example: 5.3364 })
  latitude: number;

  @ApiProperty({ example: -4.0267 })
  longitude: number;
}

/**
 * Entité ChargePoint brute, sans relation jointe.
 *
 * C'est la forme renvoyée quand une borne est incluse via `chargePoint: true`
 * — par exemple dans le détail d'une session : ni `connectors`, ni
 * `applicableTariff` ne sont alors présents.
 */
export class ChargePointEntityDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'AKNA-PLATEAU-01' })
  ocppId: string;

  @ApiProperty({ example: 'Station Plateau Central' })
  name: string;

  @ApiProperty({ enum: ChargePointType })
  type: ChargePointType;

  @ApiProperty({ example: 22 })
  powerKw: number;

  @ApiProperty({ enum: ChargePointStatus })
  status: ChargePointStatus;

  @ApiPropertyOptional({
    format: 'uuid',
    nullable: true,
    description: 'Opérateur de la borne (utilisateur au rôle HOST).',
  })
  hostId: string | null;

  @ApiProperty({ example: 5.3364 })
  latitude: number;

  @ApiProperty({ example: -4.0267 })
  longitude: number;

  @ApiPropertyOptional({ example: 'Bd de la République', nullable: true })
  address: string | null;

  @ApiPropertyOptional({ example: 'Plateau', nullable: true })
  zone: string | null;

  @ApiPropertyOptional({ example: 'Abidjan', nullable: true })
  city: string | null;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  lastSeenAt: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt: string;
}

/** Station complète : entité ChargePoint + connecteurs + tarif applicable. */
export class StationDetailDto extends ChargePointEntityDto {
  @ApiProperty({ type: [ConnectorDto] })
  connectors: ConnectorDto[];

  @ApiPropertyOptional({
    type: ApplicableTariffDto,
    nullable: true,
    description: 'Tarif actif retenu pour ce type de borne. null si aucun.',
  })
  applicableTariff: ApplicableTariffDto | null;
}
