import { Controller, Get, Post, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Role, SessionStatus } from '@prisma/client';
import { ChargingSessionsService } from '../charging-sessions.service';
import { CustomRequest } from '../../../shared/interfaces/custom-request';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin/sessions')
export class ChargingSessionsAdminController {
  constructor(private readonly sessionsService: ChargingSessionsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des sessions (paginé, filtres)' })
  async findAll(@Req() req: CustomRequest) {
    const filters = req.filters || {};
    const result = await this.sessionsService.findAllAdmin(
      {
        status: req.query.status as SessionStatus,
        chargePointId: req.query.chargePointId as string,
        userId: req.query.userId as string,
        startDate: filters.periode?.startDate,
        endDate: filters.periode?.endDate,
      },
      req.pagination,
    );
    return { data: result };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques globales des sessions' })
  async getStats() {
    const stats = await this.sessionsService.getStatsAdmin();
    return { data: stats };
  }

  @Get(':id')
  @ApiOperation({ summary: "Détails d'une session" })
  async findOne(@Param('id') id: string) {
    const session = await this.sessionsService.findByIdAdmin(id);
    return { data: session };
  }

  @Post(':id/stop')
  @ApiOperation({ summary: 'Arrêt forcé d’une session' })
  async stopSession(@Param('id') id: string) {
    const session = await this.sessionsService.stopSessionAdmin(id);
    return { data: session, message: 'Session arrêtée par l’opérateur' };
  }
}
