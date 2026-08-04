import { Controller, Get, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { SettingsService } from '../settings.service';
import { CustomRequest } from '../../../shared/interfaces/custom-request';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin')
export class SettingsAdminController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('settings')
  @ApiOperation({ summary: 'Récupérer les paramètres généraux de la plateforme' })
  async getSettings() {
    const settings = await this.settingsService.getSettings();
    return { data: settings };
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Journal d\'audit des actions d\'administration' })
  async getAuditLogs(@Req() req: CustomRequest) {
    const result = await this.settingsService.getAuditLogs(req.pagination);
    return { data: result, message: 'Journal d\'audit récupéré' };
  }
}
