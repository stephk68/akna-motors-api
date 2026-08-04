import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsAdminController } from './admin/payments.admin.controller';

@Module({
  controllers: [PaymentsAdminController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
