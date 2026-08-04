import { Module } from '@nestjs/common';
import { ChargePointsService } from './charge-points.service';
import { ChargePointsAdminController } from './admin/charge-points.admin.controller';
import { ChargePointsMobileController } from './mobile/charge-points.mobile.controller';

@Module({
  controllers: [ChargePointsAdminController, ChargePointsMobileController],
  providers: [ChargePointsService],
  exports: [ChargePointsService],
})
export class ChargePointsModule {}
