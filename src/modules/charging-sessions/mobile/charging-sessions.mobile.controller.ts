import { Controller, Get, Post, Param, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChargingSessionsService } from '../charging-sessions.service';
import { CustomRequest } from '../../../shared/interfaces/custom-request';
import { StartSessionDto } from '../dto/start-session.dto';

@ApiTags('mobile')
@ApiBearerAuth()
@Controller('mobile/sessions')
export class ChargingSessionsMobileController {
  constructor(private readonly sessionsService: ChargingSessionsService) {}

  @Get()
  @ApiOperation({ summary: 'Mes sessions de recharge' })
  async findMySessions(@Req() req: CustomRequest) {
    const sessions = await this.sessionsService.findAllMobile(
      req.user.id,
      req.pagination,
    );
    return { data: sessions };
  }

  @Post('start')
  @ApiOperation({ summary: 'Démarrer une session de recharge' })
  async startSession(@Req() req: CustomRequest, @Body() dto: StartSessionDto) {
    const session = await this.sessionsService.startSessionMobile(
      req.user.id,
      dto,
    );
    return { data: session, message: 'Session de recharge démarrée' };
  }

  @Post(':id/stop')
  @ApiOperation({ summary: 'Arrêter une session de recharge' })
  async stopSession(@Req() req: CustomRequest, @Param('id') id: string) {
    const session = await this.sessionsService.stopSessionMobile(
      req.user.id,
      id,
    );
    return { data: session, message: 'Session de recharge terminée' };
  }

  @Get(':id/live')
  @ApiOperation({ summary: 'Suivi en direct d’une session' })
  async getLiveSession(@Req() req: CustomRequest, @Param('id') id: string) {
    const liveData = await this.sessionsService.getLiveSessionMobile(
      req.user.id,
      id,
    );
    return { data: liveData };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d’une de mes sessions' })
  async findOne(@Req() req: CustomRequest, @Param('id') id: string) {
    const session = await this.sessionsService.findDetailMobile(
      req.user.id,
      id,
    );
    return { data: session };
  }
}
