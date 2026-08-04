import { Module } from '@nestjs/common';
import { ChargingSessionsService } from './charging-sessions.service';
import { ChargingSessionsAdminController } from './admin/charging-sessions.admin.controller';
import { ChargingSessionsMobileController } from './mobile/charging-sessions.mobile.controller';

@Module({
  controllers: [ChargingSessionsAdminController, ChargingSessionsMobileController],
  providers: [ChargingSessionsService],
  exports: [ChargingSessionsService],
})
export class ChargingSessionsModule {}
