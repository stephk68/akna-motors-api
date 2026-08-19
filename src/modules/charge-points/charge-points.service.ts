import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma.service';
import { PaginationService } from '../../shared/services/pagination.service';
import { PaginationParams } from '../../shared/interfaces/pagination-params';
import { CreateChargePointDto, UpdateChargePointDto } from './dto/create-charge-point.dto';
import { CreateConnectorDto, UpdateConnectorDto } from './dto/create-connector.dto';
import { ChargePointStatus, ChargePointType } from '@prisma/client';

@Injectable()
export class ChargePointsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationService: PaginationService,
  ) {}

  async findAllAdmin(
    filters: {
      status?: ChargePointStatus;
      type?: ChargePointType;
      city?: string;
      hostId?: string;
      search?: string;
    },
    pagination?: PaginationParams,
  ) {
    const where: any = {};

    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;
    if (filters.city) where.city = { contains: filters.city, mode: 'insensitive' };
    if (filters.hostId) where.hostId = filters.hostId;

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { ocppId: { contains: filters.search, mode: 'insensitive' } },
        { city: { contains: filters.search, mode: 'insensitive' } },
        { address: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.paginationService.paginate(
      this.prisma.chargePoint,
      {
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          connectors: true,
          host: { select: { id: true, firstName: true, lastName: true, email: true } },
          _count: { select: { sessions: true } },
        },
      },
      pagination,
    );
  }

  async getMapPoints() {
    return this.prisma.chargePoint.findMany({
      select: {
        id: true,
        ocppId: true,
        name: true,
        latitude: true,
        longitude: true,
        status: true,
        powerKw: true,
        type: true,
        city: true,
        zone: true,
        address: true,
        connectors: {
          select: {
            id: true,
            connectorId: true,
            standard: true,
            status: true,
          },
        },
      },
    });
  }

  async findByIdAdmin(id: string) {
    const cp = await this.prisma.chargePoint.findUnique({
      where: { id },
      include: {
        connectors: true,
        host: { select: { id: true, firstName: true, lastName: true, phone: true } },
        tickets: { take: 5, orderBy: { createdAt: 'desc' } },
        _count: { select: { sessions: true } },
      },
    });

    if (!cp) {
      throw new NotFoundException(`Borne ${id} introuvable.`);
    }

    return cp;
  }

  async getTelemetry(id: string) {
    const cp = await this.findByIdAdmin(id);
    // Stub telemetry (P1 mock)
    return {
      chargePointId: cp.id,
      ocppId: cp.ocppId,
      status: cp.status,
      powerKw: cp.powerKw,
      voltage: 400,
      currentAmps: 32,
      soc: cp.status === ChargePointStatus.OCCUPIED ? 68 : null,
      temperatureC: 38.5,
      timestamp: new Date().toISOString(),
    };
  }

  async getSessionsAdmin(id: string, pagination?: PaginationParams) {
    return this.paginationService.paginate(
      this.prisma.chargingSession,
      {
        where: { chargePointId: id },
        orderBy: { startedAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, phone: true } },
        },
      },
      pagination,
    );
  }

  async create(dto: CreateChargePointDto) {
    return this.prisma.chargePoint.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdateChargePointDto) {
    await this.findByIdAdmin(id);
    return this.prisma.chargePoint.update({
      where: { id },
      data: dto,
    });
  }

  async remoteStart(id: string, connectorId = 1) {
    const cp = await this.findByIdAdmin(id);
    // Stub remote start command
    return {
      success: true,
      command: 'RemoteStartTransaction',
      chargePointId: cp.id,
      ocppId: cp.ocppId,
      connectorId,
      status: 'Accepted',
      timestamp: new Date().toISOString(),
    };
  }

  async remoteStop(id: string) {
    const cp = await this.findByIdAdmin(id);
    // Stub remote stop command
    return {
      success: true,
      command: 'RemoteStopTransaction',
      chargePointId: cp.id,
      ocppId: cp.ocppId,
      status: 'Accepted',
      timestamp: new Date().toISOString(),
    };
  }

  // Connectors CRUD
  async addConnector(chargePointId: string, dto: CreateConnectorDto) {
    await this.findByIdAdmin(chargePointId);
    return this.prisma.connector.create({
      data: {
        chargePointId,
        connectorId: dto.connectorId,
        standard: dto.standard,
        status: dto.status || ChargePointStatus.AVAILABLE,
      },
    });
  }

  async updateConnector(chargePointId: string, connectorIdNumber: number, dto: UpdateConnectorDto) {
    const connector = await this.prisma.connector.findUnique({
      where: { chargePointId_connectorId: { chargePointId, connectorId: connectorIdNumber } },
    });
    if (!connector) throw new NotFoundException('Connecteur introuvable');

    return this.prisma.connector.update({
      where: { id: connector.id },
      data: dto,
    });
  }

  async deleteConnector(chargePointId: string, connectorIdNumber: number) {
    return this.prisma.connector.deleteMany({
      where: { chargePointId, connectorId: connectorIdNumber },
    });
  }

  // Mobile endpoints
  async findStationsMobile(params: {
    lat?: number;
    lng?: number;
    radiusKm?: number;
    type?: ChargePointType;
    availableOnly?: boolean;
    search?: string;
  }) {
    const where: any = {};
    if (params.type) where.type = params.type;
    if (params.availableOnly) where.status = ChargePointStatus.AVAILABLE;
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { address: { contains: params.search, mode: 'insensitive' } },
        { city: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const stations = await this.prisma.chargePoint.findMany({
      where,
      include: {
        connectors: true,
      },
    });

    return stations.map((s) => {
      const freeConnectors = s.connectors.filter(
        (c) => c.status === ChargePointStatus.AVAILABLE,
      ).length;

      // Calcul approximatif de distance
      let distanceKm: number | null = null;
      if (params.lat && params.lng) {
        const dLat = (s.latitude - params.lat) * 111;
        const dLng = (s.longitude - params.lng) * 111;
        distanceKm = Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 10) / 10;
      }

      return {
        id: s.id,
        ocppId: s.ocppId,
        name: s.name,
        address: s.address,
        type: s.type,
        powerKw: s.powerKw,
        status: s.status,
        freeConnectors,
        totalConnectors: s.connectors.length,
        distanceKm,
        latitude: s.latitude,
        longitude: s.longitude,
      };
    });
  }

  async findStationMobileDetail(id: string) {
    const station = await this.prisma.chargePoint.findUnique({
      where: { id },
      include: {
        connectors: true,
      },
    });

    if (!station) {
      throw new NotFoundException(`Station ${id} introuvable.`);
    }

    const tariff = await this.prisma.tariff.findFirst({
      where: {
        active: true,
        OR: [{ chargePointType: station.type }, { chargePointType: null }],
      },
    });

    return {
      ...station,
      applicableTariff: tariff,
    };
  }
}
