import { Controller, Get, Post, Param, Body, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { ChargingSessionsService } from '../charging-sessions.service';
import { CustomRequest } from '../../../shared/interfaces/custom-request';
import { StartSessionDto } from '../dto/start-session.dto';
import {
  ApiEnvelopePaginatedResponse,
  ApiEnvelopeResponse,
  ApiErrorResponseDto,
} from '../../../shared/dto/api-response.dto';
import {
  SessionDetailDto,
  SessionListItemDto,
  SessionLiveDto,
  SessionStartedDto,
  SessionStoppedDto,
} from '../dto/session-response.dto';

@ApiTags('mobile')
@ApiBearerAuth()
@Controller('mobile/sessions')
export class ChargingSessionsMobileController {
  constructor(private readonly sessionsService: ChargingSessionsService) {}

  @Get()
  @ApiOperation({ summary: 'Mes sessions de recharge' })
  @ApiEnvelopePaginatedResponse(SessionListItemDto, {
    description:
      'Paginé, trié du plus récent au plus ancien. La borne est jointe en version résumée.',
  })
  async findMySessions(@Req() req: CustomRequest) {
    const sessions = await this.sessionsService.findAllMobile(
      req.user.id,
      req.pagination,
    );
    return { data: sessions };
  }

  @Post('start')
  @ApiOperation({ summary: 'Démarrer une session de recharge' })
  @ApiEnvelopeResponse(SessionStartedDto, {
    status: 201,
    description:
      'Session créée au statut CHARGING. `energyKwh`, `durationSec` et `costFcfa` restent null jusqu’à l’arrêt.',
  })
  @ApiNotFoundResponse({
    type: ApiErrorResponseDto,
    description: 'Borne introuvable.',
  })
  async startSession(@Req() req: CustomRequest, @Body() dto: StartSessionDto) {
    const session = await this.sessionsService.startSessionMobile(
      req.user.id,
      dto,
    );
    return { data: session, message: 'Session de recharge démarrée' };
  }

  @Post(':id/stop')
  @ApiOperation({ summary: 'Arrêter une session de recharge' })
  @ApiEnvelopeResponse(SessionStoppedDto, {
    status: 201,
    description:
      'Session passée à COMPLETED. Entité seule, sans relation jointe : l’énergie, la durée et le coût viennent d’être calculés.',
  })
  @ApiNotFoundResponse({
    type: ApiErrorResponseDto,
    description: 'Session introuvable.',
  })
  async stopSession(@Req() req: CustomRequest, @Param('id') id: string) {
    const session = await this.sessionsService.stopSessionMobile(
      req.user.id,
      id,
    );
    return { data: session, message: 'Session de recharge terminée' };
  }

  @Get(':id/live')
  @ApiOperation({ summary: 'Suivi en direct d’une session' })
  @ApiEnvelopeResponse(SessionLiveDto, {
    description:
      'Projection calculée à la volée pour le suivi temps réel — ce n’est pas l’entité session. Valeurs estimées tant que la recharge est en cours.',
  })
  @ApiNotFoundResponse({
    type: ApiErrorResponseDto,
    description: 'Session introuvable.',
  })
  async getLiveSession(@Req() req: CustomRequest, @Param('id') id: string) {
    const liveData = await this.sessionsService.getLiveSessionMobile(
      req.user.id,
      id,
    );
    return { data: liveData };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d’une de mes sessions' })
  @ApiEnvelopeResponse(SessionDetailDto, {
    description:
      'Borne, véhicule et paiement joints. Le tarif n’est pas inclus : seul `tariffId` est disponible.',
  })
  @ApiNotFoundResponse({
    type: ApiErrorResponseDto,
    description: 'Session introuvable.',
  })
  async findOne(@Req() req: CustomRequest, @Param('id') id: string) {
    const session = await this.sessionsService.findDetailMobile(
      req.user.id,
      id,
    );
    return { data: session };
  }
}
