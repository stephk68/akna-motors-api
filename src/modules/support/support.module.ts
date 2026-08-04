import { Module } from '@nestjs/common';
import { SupportService } from './support.service';
import { SupportAdminController } from './admin/support.admin.controller';

@Module({
  controllers: [SupportAdminController],
  providers: [SupportService],
  exports: [SupportService],
})
export class SupportModule {}
