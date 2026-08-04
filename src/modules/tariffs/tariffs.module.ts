import { Module } from '@nestjs/common';
import { TariffsService } from './tariffs.service';
import { TariffsAdminController } from './admin/tariffs.admin.controller';

@Module({
  controllers: [TariffsAdminController],
  providers: [TariffsService],
  exports: [TariffsService],
})
export class TariffsModule {}
