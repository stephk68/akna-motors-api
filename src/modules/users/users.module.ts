import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersAdminController } from './admin/users.admin.controller';
import { UsersMobileController } from './mobile/users.mobile.controller';

@Module({
  controllers: [UsersAdminController, UsersMobileController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
