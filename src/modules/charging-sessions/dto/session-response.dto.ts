import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ChargePointType,
  PaymentProvider,
  PaymentStatus,
  SessionStatus,
} from '@prisma/client';
import { ChargePointEntityDto } from '../../charge-points/dto/station-response.dto';
import { VehicleDto } from '../../vehicles/dto/vehicle-response.dto';

/** Borne résumée, jointe à une session de la liste. */
export class SessionChargePointSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Station Plateau Central' })
  name: string;

  @ApiPropertyOptional({ example: 'Abidjan', nullable: true })
  city: string | null;

  @ApiPropertyOptional({ example: 'Bd de la République', nullable: true })
  address: string | null;
}

/** Borne résumée renvoyée au démarrage d'une session. */
export class SessionStartChargePointDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Station Plateau Central' })
  name: string;

  @ApiProperty({ enum: ChargePointType })
  type: ChargePointType;

  @ApiProperty({ example: 22 })
  powerKw: number;
}

/** Champs communs à toutes les représentations d'une session. */
class SessionBaseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  userId: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  vehicleId: string | null;

  @ApiProperty({ format: 'uuid' })
  chargePointId: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  connectorId: string | null;

  @ApiProperty({ enum: SessionStatus })
  status: SessionStatus;

  @ApiProperty({ format: 'date-time' })
  startedAt: string;

  @ApiPropertyOptional({
    format: 'date-time',
    nullable: true,
    description: 'null tant que la session est en cours.',
  })
  endedAt: string | null;

  @ApiPropertyOptional({
    example: 12.4,
    nullable: true,
    type: Number,
    description: 'kWh délivrés. Renseigné à l’arrêt de la session.',
  })
  energyKwh: number | null;

  @ApiPropertyOptional({ example: 4080, nullable: true, type: Number })
  durationSec: number | null;

  @ApiPropertyOptional({
    example: 2232,
    nullable: true,
    type: Number,
    description: 'Coût en FCFA, entier. Calculé à l’arrêt.',
  })
  costFcfa: number | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  tariffId: string | null;

  @ApiPropertyOptional({ example: 10241, nullable: true, type: Number })
  ocppTransactionId: number | null;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt: string;
}

/** Élément de la liste paginée `GET /mobile/sessions`. */
export class SessionListItemDto extends SessionBaseDto {
  @ApiProperty({ type: SessionChargePointSummaryDto })
  chargePoint: SessionChargePointSummaryDto;
}

/** Réponse de `POST /mobile/sessions/start`. */
export class SessionStartedDto extends SessionBaseDto {
  @ApiProperty({ type: SessionStartChargePointDto })
  chargePoint: SessionStartChargePointDto;
}

/**
 * Réponse de `POST /mobile/sessions/{id}/stop`.
 *
 * Entité seule, sans relation jointe : `energyKwh`, `durationSec` et
 * `costFcfa` viennent d'être calculés et sont donc renseignés.
 */
export class SessionStoppedDto extends SessionBaseDto {}

/**
 * Réponse de `GET /mobile/sessions/{id}/live`.
 *
 * Projection calculée à la volée pour le suivi temps réel — ce n'est pas
 * l'entité ChargingSession. Les valeurs sont estimées tant que la session
 * n'est pas arrêtée.
 */
export class SessionLiveDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ enum: SessionStatus })
  status: SessionStatus;

  @ApiProperty({ format: 'date-time' })
  startedAt: string;

  @ApiProperty({ example: 1830, description: 'Secondes écoulées depuis le démarrage.' })
  elapsedSec: number;

  @ApiProperty({ example: 5.6, description: 'kWh estimés à l’instant T.' })
  energyKwh: number;

  @ApiProperty({ example: 22, description: 'Puissance de la borne, en kW.' })
  powerKw: number;

  @ApiProperty({ example: 62, description: 'État de charge estimé, en %.' })
  soc: number;

  @ApiProperty({ example: 1008, description: 'Coût estimé en FCFA.' })
  estimatedCostFcfa: number;
}

/** Paiement joint au détail d'une session. */
export class SessionPaymentDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  userId: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  sessionId: string | null;

  @ApiProperty({ enum: PaymentProvider })
  provider: PaymentProvider;

  @ApiProperty({ example: 2232, description: 'Montant en FCFA, entier.' })
  amountFcfa: number;

  @ApiProperty({ enum: PaymentStatus })
  status: PaymentStatus;

  @ApiPropertyOptional({
    example: 'CP-TX-88213',
    nullable: true,
    description: 'Référence de transaction chez le PSP.',
  })
  providerRef: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt: string;
}

/**
 * Réponse de `GET /mobile/sessions/{id}`.
 *
 * Seules `chargePoint`, `vehicle` et `payment` sont jointes. Le tarif n'est
 * pas inclus par cette route : seul `tariffId` est disponible.
 */
export class SessionDetailDto extends SessionBaseDto {
  @ApiProperty({
    type: ChargePointEntityDto,
    description: 'Borne brute, sans ses connecteurs.',
  })
  chargePoint: ChargePointEntityDto;

  @ApiPropertyOptional({
    type: VehicleDto,
    nullable: true,
    description: 'null si la session n’est rattachée à aucun véhicule.',
  })
  vehicle: VehicleDto | null;

  @ApiPropertyOptional({
    type: SessionPaymentDto,
    nullable: true,
    description: 'null tant qu’aucun paiement n’a été créé.',
  })
  payment: SessionPaymentDto | null;
}
