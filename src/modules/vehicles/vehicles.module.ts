import { Module } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { VehiclesAdminController } from './admin/vehicles.admin.controller';
import { VehiclesMobileController } from './mobile/vehicles.mobile.controller';

@Module({
  controllers: [VehiclesAdminController, VehiclesMobileController],
  providers: [VehiclesService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
