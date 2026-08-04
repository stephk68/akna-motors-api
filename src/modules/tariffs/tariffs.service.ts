import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma.service';
import { PaginationService } from '../../shared/services/pagination.service';
import { PaginationParams } from '../../shared/interfaces/pagination-params';
import { CreateTariffDto, UpdateTariffDto, SimulateTariffDto } from './dto/create-tariff.dto';
import { ChargePointType, Role } from '@prisma/client';

@Injectable()
export class TariffsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationService: PaginationService,
  ) {}

  async findAllAdmin(
    filters: { active?: boolean; targetRole?: Role; chargePointType?: ChargePointType; search?: string },
    pagination?: PaginationParams,
  ) {
    const where: any = {};

    if (filters.active !== undefined) where.active = filters.active;
    if (filters.targetRole) where.targetRole = filters.targetRole;
    if (filters.chargePointType) where.chargePointType = filters.chargePointType;

    if (filters.search) {
      where.name = { contains: filters.search, mode: 'insensitive' };
    }

    return this.paginationService.paginate(
      this.prisma.tariff,
      {
        where,
        orderBy: { createdAt: 'desc' },
      },
      pagination,
    );
  }

  async findByIdAdmin(id: string) {
    const tariff = await this.prisma.tariff.findUnique({
      where: { id },
    });

    if (!tariff) throw new NotFoundException(`Tarif ${id} introuvable.`);
    return tariff;
  }

  async create(dto: CreateTariffDto) {
    return this.prisma.tariff.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdateTariffDto) {
    await this.findByIdAdmin(id);
    return this.prisma.tariff.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string) {
    await this.findByIdAdmin(id);
    return this.prisma.tariff.delete({
      where: { id },
    });
  }

  async simulate(dto: SimulateTariffDto) {
    const type = dto.chargePointType || ChargePointType.DC;
    const basePrice = type === ChargePointType.DC || type === ChargePointType.DC_ULTRA ? 165 : 120;
    const peakMultiplier = dto.isPeak ? (type === ChargePointType.DC ? 1.2 : 1.15) : 1.0;
    const totalCostFcfa = Math.round(dto.energyKwh * basePrice * peakMultiplier);

    return {
      energyKwh: dto.energyKwh,
      chargePointType: type,
      isPeak: !!dto.isPeak,
      basePricePerKwh: basePrice,
      peakMultiplier,
      totalCostFcfa,
    };
  }
}
