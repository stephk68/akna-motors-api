import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsAdminController } from './admin/settings.admin.controller';

@Module({
  controllers: [SettingsAdminController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
