import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { PaginationMiddleware } from './shared/middlewares/pagination.middleware';
import { FiltersMiddleware } from './shared/middlewares/filters.middleware';
import { CacheHeadersMiddleware } from './shared/middlewares/cache-headers.middleware';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { RolesGuard } from './shared/guards/roles.guard';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ChargePointsModule } from './modules/charge-points/charge-points.module';
import { ChargingSessionsModule } from './modules/charging-sessions/charging-sessions.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { TariffsModule } from './modules/tariffs/tariffs.module';
import { SupportModule } from './modules/support/support.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SettingsModule } from './modules/settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        fallthrough: true,
      },
    }),
    SharedModule,
    AuthModule,
    UsersModule,
    ChargePointsModule,
    ChargingSessionsModule,
    VehiclesModule,
    DashboardModule,
    TariffsModule,
    SupportModule,
    PaymentsModule,
    ReportsModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Sécurité par défaut : toute route est protégée sauf @Public().
    // L'ordre compte — JwtAuthGuard résout req.user, RolesGuard le lit.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PaginationMiddleware, FiltersMiddleware, CacheHeadersMiddleware)
      .forRoutes('*');
  }
}
