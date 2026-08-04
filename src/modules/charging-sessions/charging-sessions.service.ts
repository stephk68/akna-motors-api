import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma.service';
import { PaginationService } from '../../shared/services/pagination.service';
import { PaginationParams } from '../../shared/interfaces/pagination-params';
import { StartSessionDto } from './dto/start-session.dto';
import { SessionStatus, ChargePointStatus } from '@prisma/client';

@Injectable()
export class ChargingSessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationService: PaginationService,
  ) {}

  async findAllAdmin(
    filters: {
      status?: SessionStatus;
      chargePointId?: string;
      userId?: string;
      startDate?: Date;
      endDate?: Date;
    },
    pagination?: PaginationParams,
  ) {
    const where: any = {};

    if (filters.status) where.status = filters.status;
    if (filters.chargePointId) where.chargePointId = filters.chargePointId;
    if (filters.userId) where.userId = filters.userId;

    if (filters.startDate || filters.endDate) {
      where.startedAt = {};
      if (filters.startDate) where.startedAt.gte = filters.startDate;
      if (filters.endDate) where.startedAt.lte = filters.endDate;
    }

    return this.paginationService.paginate(
      this.prisma.chargingSession,
      {
        where,
        orderBy: { startedAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
          chargePoint: { select: { id: true, name: true, city: true, type: true } },
          vehicle: { select: { id: true, make: true, model: true, plate: true } },
          tariff: { select: { id: true, name: true, pricePerKwh: true } },
        },
      },
      pagination,
    );
  }

  async findByIdAdmin(id: string) {
    const session = await this.prisma.chargingSession.findUnique({
      where: { id },
      include: {
        user: true,
        chargePoint: true,
        connector: true,
        vehicle: true,
        tariff: true,
        payment: true,
      },
    });

    if (!session) {
      throw new NotFoundException(`Session ${id} introuvable.`);
    }

    return session;
  }

  async getStatsAdmin() {
    const totalSessions = await this.prisma.chargingSession.count();
    const activeSessions = await this.prisma.chargingSession.count({
      where: { status: { in: [SessionStatus.STARTED, SessionStatus.CHARGING] } },
    });

    const aggregates = await this.prisma.chargingSession.aggregate({
      _sum: {
        energyKwh: true,
        costFcfa: true,
      },
    });

    const byStatusRaw = await this.prisma.chargingSession.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const byStatus = byStatusRaw.reduce((acc, item) => {
      acc[item.status] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSessions,
      activeSessions,
      totalEnergyKwh: aggregates._sum.energyKwh || 0,
      totalRevenueFcfa: aggregates._sum.costFcfa || 0,
      byStatus,
    };
  }

  async stopSessionAdmin(id: string) {
    const session = await this.findByIdAdmin(id);

    if (session.status === SessionStatus.COMPLETED || session.status === SessionStatus.STOPPED) {
      throw new BadRequestException('Session déjà terminée.');
    }

    const endedAt = new Date();
    const durationSec = Math.floor((endedAt.getTime() - session.startedAt.getTime()) / 1000);
    const energyKwh = session.energyKwh || Math.round((durationSec / 3600) * 15 * 10) / 10;
    const pricePerKwh = session.tariff?.pricePerKwh || 180;
    const costFcfa = Math.round(energyKwh * pricePerKwh);

    const updated = await this.prisma.chargingSession.update({
      where: { id },
      data: {
        status: SessionStatus.COMPLETED,
        endedAt,
        durationSec,
        energyKwh,
        costFcfa,
      },
    });

    if (session.chargePointId) {
      await this.prisma.chargePoint.update({
        where: { id: session.chargePointId },
        data: { status: ChargePointStatus.AVAILABLE },
      });
    }

    return updated;
  }

  // Mobile
  async startSessionMobile(userId: string, dto: StartSessionDto) {
    const cp = await this.prisma.chargePoint.findUnique({
      where: { id: dto.chargePointId },
    });

    if (!cp) throw new NotFoundException('Borne introuvable');

    const tariff = await this.prisma.tariff.findFirst({
      where: { active: true },
    });

    const session = await this.prisma.chargingSession.create({
      data: {
        userId,
        chargePointId: dto.chargePointId,
        connectorId: dto.connectorId,
        vehicleId: dto.vehicleId,
        tariffId: tariff?.id,
        status: SessionStatus.CHARGING,
        startedAt: new Date(),
      },
      include: {
        chargePoint: { select: { id: true, name: true, type: true, powerKw: true } },
      },
    });

    await this.prisma.chargePoint.update({
      where: { id: dto.chargePointId },
      data: { status: ChargePointStatus.OCCUPIED },
    });

    return session;
  }

  async stopSessionMobile(userId: string, id: string) {
    const session = await this.prisma.chargingSession.findFirst({
      where: { id, userId },
      include: { tariff: true },
    });

    if (!session) throw new NotFoundException('Session introuvable');

    const endedAt = new Date();
    const durationSec = Math.floor((endedAt.getTime() - session.startedAt.getTime()) / 1000);
    const energyKwh = Math.round(((durationSec / 3600) * 11) * 10) / 10;
    const pricePerKwh = session.tariff?.pricePerKwh || 180;
    const costFcfa = Math.round(energyKwh * pricePerKwh);

    const updated = await this.prisma.chargingSession.update({
      where: { id },
      data: {
        status: SessionStatus.COMPLETED,
        endedAt,
        durationSec,
        energyKwh,
        costFcfa,
      },
    });

    await this.prisma.chargePoint.update({
      where: { id: session.chargePointId },
      data: { status: ChargePointStatus.AVAILABLE },
    });

    return updated;
  }

  async getLiveSessionMobile(userId: string, id: string) {
    const session = await this.prisma.chargingSession.findFirst({
      where: { id, userId },
      include: { chargePoint: true },
    });

    if (!session) throw new NotFoundException('Session introuvable');

    const elapsedSec = Math.floor((Date.now() - session.startedAt.getTime()) / 1000);
    const energyKwh = Math.round(((elapsedSec / 3600) * (session.chargePoint.powerKw || 11)) * 10) / 10;
    const estimatedCostFcfa = Math.round(energyKwh * 180);
    const soc = Math.min(100, Math.floor(20 + (elapsedSec / 1800) * 80));

    return {
      id: session.id,
      status: session.status,
      startedAt: session.startedAt,
      elapsedSec,
      energyKwh,
      powerKw: session.chargePoint.powerKw,
      soc,
      estimatedCostFcfa,
    };
  }

  async findAllMobile(userId: string, pagination?: PaginationParams) {
    return this.paginationService.paginate(
      this.prisma.chargingSession,
      {
        where: { userId },
        orderBy: { startedAt: 'desc' },
        include: {
          chargePoint: { select: { id: true, name: true, city: true, address: true } },
        },
      },
      pagination,
    );
  }

  async findDetailMobile(userId: string, id: string) {
    const session = await this.prisma.chargingSession.findFirst({
      where: { id, userId },
      include: {
        chargePoint: true,
        vehicle: true,
        payment: true,
      },
    });

    if (!session) throw new NotFoundException('Session introuvable');
    return session;
  }
}
