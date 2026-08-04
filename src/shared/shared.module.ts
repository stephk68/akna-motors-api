import { Global, Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { FileService } from './services/file.service';
import { PaginationService } from './services/pagination.service';
import { MailService } from './services/mail.service';
import { LifecycleService } from './lifecycles/lifecycleService';
import { CacheModule } from './cache/cache.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Global()
@Module({
  imports: [CacheModule],
  providers: [
    PrismaService,
    FileService,
    PaginationService,
    MailService,
    LifecycleService,
    JwtStrategy,
  ],
  exports: [
    PrismaService,
    FileService,
    PaginationService,
    MailService,
    LifecycleService,
    CacheModule,
    JwtStrategy,
  ],
})
export class SharedModule {}
