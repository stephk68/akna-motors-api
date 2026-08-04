import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma.service';
import { PaginationService } from '../../shared/services/pagination.service';
import { PaginationParams } from '../../shared/interfaces/pagination-params';

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationService: PaginationService,
  ) {}

  async getSettings() {
    return {
      platformName: 'AKNA Electric Mobility',
      currency: 'XOF',
      timeZone: 'Africa/Abidjan',
      ocppServerUrl: 'wss://ocpp.aknamotors.ci/v16',
      supportedProviders: ['ORANGE_MONEY', 'MTN_MOMO', 'WAVE', 'CARD', 'WALLET'],
      supportPhone: '+225 07 00 00 00 00',
      supportEmail: 'contact@aknamotors.ci',
    };
  }

  async getAuditLogs(pagination?: PaginationParams) {
    return this.paginationService.paginate(
      this.prisma.auditLog,
      {
        orderBy: { createdAt: 'desc' },
      },
      pagination,
    );
  }

  async logAction(actorId: string, action: string, targetType?: string, targetId?: string, metadata?: any) {
    return this.prisma.auditLog.create({
      data: {
        actorId,
        action,
        targetType,
        targetId,
        metadata: metadata || undefined,
      },
    });
  }
}
