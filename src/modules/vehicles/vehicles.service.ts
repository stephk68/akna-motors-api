import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma.service';
import { PaginationService } from '../../shared/services/pagination.service';
import { PaginationParams } from '../../shared/interfaces/pagination-params';
import { CreateVehicleDto, UpdateVehicleDto } from './dto/create-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationService: PaginationService,
  ) {}

  async findAllAdmin(
    filters: { ownerId?: string; organizationId?: string; search?: string },
    pagination?: PaginationParams,
  ) {
    const where: any = {};

    if (filters.ownerId) where.ownerId = filters.ownerId;
    if (filters.organizationId) where.organizationId = filters.organizationId;

    if (filters.search) {
      where.OR = [
        { plate: { contains: filters.search, mode: 'insensitive' } },
        { make: { contains: filters.search, mode: 'insensitive' } },
        { model: { contains: filters.search, mode: 'insensitive' } },
        { vin: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.paginationService.paginate(
      this.prisma.vehicle,
      {
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: { select: { id: true, firstName: true, lastName: true, phone: true } },
          organization: { select: { id: true, name: true } },
          _count: { select: { sessions: true } },
        },
      },
      pagination,
    );
  }

  async findByIdAdmin(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        owner: true,
        organization: true,
        sessions: { take: 5, orderBy: { startedAt: 'desc' } },
      },
    });

    if (!vehicle) throw new NotFoundException(`Véhicule ${id} introuvable.`);
    return vehicle;
  }

  async getTelemetry(id: string) {
    const vehicle = await this.findByIdAdmin(id);
    return {
      vehicleId: vehicle.id,
      vin: vehicle.vin,
      lastBatteryPct: vehicle.lastBatteryPct || 82,
      lastRangeKm: vehicle.lastRangeKm || 340,
      lastLatitude: vehicle.lastLatitude || 5.3489,
      lastLongitude: vehicle.lastLongitude || -4.0105,
      odometerKm: vehicle.odometerKm || 24500,
      activeDtcCount: vehicle.activeDtcCount || 0,
      lastSeenAt: vehicle.lastSeenAt || new Date().toISOString(),
    };
  }

  async createAdmin(dto: CreateVehicleDto) {
    let ownerId = dto.ownerId;
    if (!ownerId) {
      const admin = await this.prisma.user.findFirst({ where: { role: 'ADMIN' } });
      if (admin) ownerId = admin.id;
    }
    return this.prisma.vehicle.create({
      data: {
        vin: dto.vin || `VIN-${Date.now()}`,
        plate: dto.plate || `AB-${Math.floor(1000 + Math.random() * 9000)}-CI`,
        make: dto.make || 'Électrique',
        model: dto.model || 'Standard',
        obdSerial: dto.obdSerial,
        ownerId,
      },
    });
  }

  // Mobile
  async findAllMobile(userId: string) {
    return this.prisma.vehicle.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createMobile(userId: string, dto: CreateVehicleDto) {
    return this.prisma.vehicle.create({
      data: {
        ownerId: userId,
        ...dto,
      },
    });
  }

  async updateMobile(userId: string, id: string, dto: UpdateVehicleDto) {
    const v = await this.prisma.vehicle.findFirst({ where: { id, ownerId: userId } });
    if (!v) throw new NotFoundException('Véhicule introuvable');

    return this.prisma.vehicle.update({
      where: { id },
      data: dto,
    });
  }

  async deleteMobile(userId: string, id: string) {
    const v = await this.prisma.vehicle.findFirst({ where: { id, ownerId: userId } });
    if (!v) throw new NotFoundException('Véhicule introuvable');

    return this.prisma.vehicle.delete({ where: { id } });
  }
}
