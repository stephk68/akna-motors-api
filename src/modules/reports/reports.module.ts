import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsAdminController } from './admin/reports.admin.controller';

@Module({
  controllers: [ReportsAdminController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
