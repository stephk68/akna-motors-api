import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ReportsService } from '../reports.service';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin/reports')
export class ReportsAdminController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Vue d\'ensemble des chiffres clés des rapports' })
  async getOverview() {
    const data = await this.reportsService.getOverview();
    return { data, message: 'Vue d\'ensemble des rapports récupérée' };
  }

  @Get('top-cities')
  @ApiOperation({ summary: 'Répartition du réseau par ville' })
  async getTopCities() {
    const data = await this.reportsService.getTopCities();
    return { data };
  }

  @Get('utilization')
  @ApiOperation({ summary: 'Taux d\'utilisation du réseau de bornes' })
  async getUtilization() {
    const data = await this.reportsService.getUtilization();
    return { data };
  }
}
