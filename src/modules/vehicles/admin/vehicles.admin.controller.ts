import { Controller, Get, Post, Patch, Param, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { VehiclesService } from '../vehicles.service';
import { CustomRequest } from '../../../shared/interfaces/custom-request';
import {
  CreateVehicleDto,
  UpdateVehicleDto,
} from '../dto/create-vehicle.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin/vehicles')
export class VehiclesAdminController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des véhicules (paginé, filtres)' })
  async findAll(@Req() req: CustomRequest) {
    const filters = req.filters || {};
    const result = await this.vehiclesService.findAllAdmin(
      { search: filters.search },
      req.pagination,
    );
    return { data: result };
  }

  @Post()
  @ApiOperation({ summary: 'Connecter / créer un véhicule' })
  async create(@Body() dto: CreateVehicleDto) {
    const vehicle = await this.vehiclesService.createAdmin(dto);
    return { data: vehicle, message: 'Véhicule connecté avec succès' };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détails d’un véhicule' })
  async findOne(@Param('id') id: string) {
    const vehicle = await this.vehiclesService.findByIdAdmin(id);
    return { data: vehicle };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un véhicule' })
  async update(@Param('id') id: string, @Body() dto: UpdateVehicleDto) {
    const vehicle = await this.vehiclesService.updateAdmin(id, dto);
    return { data: vehicle, message: 'Véhicule mis à jour' };
  }

  @Get(':id/telemetry')
  @ApiOperation({ summary: 'Télémétrie d’un véhicule' })
  async getTelemetry(@Param('id') id: string) {
    const telemetry = await this.vehiclesService.getTelemetry(id);
    return { data: telemetry };
  }
}
