import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { DashboardService } from '../dashboard.service';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin/dashboard')
export class DashboardAdminController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpis')
  @ApiOperation({ summary: 'KPIs principaux du dashboard' })
  async getKpis() {
    const kpis = await this.dashboardService.getKpis();
    return { data: kpis };
  }

  @Get('series')
  @ApiOperation({ summary: 'Séries temporelles pour les graphiques (7d / 30d)' })
  async getSeries(@Query('range') range?: '7d' | '30d') {
    const series = await this.dashboardService.getSeries(range || '7d');
    return { data: series };
  }

  @Get('recent-sessions')
  @ApiOperation({ summary: 'Sessions de recharge récentes' })
  async getRecentSessions(@Query('limit') limit?: string) {
    const count = limit ? parseInt(limit, 10) : 6;
    const sessions = await this.dashboardService.getRecentSessions(count);
    return { data: sessions };
  }
}
