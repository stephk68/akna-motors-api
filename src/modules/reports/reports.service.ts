import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const [totalSessions, totalRevenueAgg, totalEnergyAgg, activeUsers] = await Promise.all([
      this.prisma.chargingSession.count(),
      this.prisma.payment.aggregate({
        _sum: { amountFcfa: true },
        where: { status: 'CONFIRMED' },
      }),
      this.prisma.chargingSession.aggregate({
        _sum: { energyKwh: true },
        where: { status: 'COMPLETED' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      totalSessions,
      totalRevenueFcfa: totalRevenueAgg._sum.amountFcfa || 0,
      totalEnergyKwh: Math.round(totalEnergyAgg._sum.energyKwh || 0),
      activeUsers,
    };
  }

  async getTopCities() {
    const cityGroups = await this.prisma.chargePoint.groupBy({
      by: ['city'],
      _count: { id: true },
    });

    return cityGroups.map((g) => ({
      city: g.city || 'Inconnue',
      chargePointsCount: g._count.id,
    }));
  }

  async getUtilization() {
    const totalChargePoints = await this.prisma.chargePoint.count();
    const occupiedChargePoints = await this.prisma.chargePoint.count({
      where: { status: 'OCCUPIED' },
    });

    const rate = totalChargePoints > 0 ? (occupiedChargePoints / totalChargePoints) * 100 : 0;

    return {
      totalChargePoints,
      occupiedChargePoints,
      utilizationRatePct: Number(rate.toFixed(1)),
    };
  }
}
