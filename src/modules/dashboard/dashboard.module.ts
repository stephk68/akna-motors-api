import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardAdminController } from './admin/dashboard.admin.controller';

@Module({
  controllers: [DashboardAdminController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
