import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Role, ChargePointStatus, ChargePointType } from '@prisma/client';
import { ChargePointsService } from '../charge-points.service';
import { CustomRequest } from '../../../shared/interfaces/custom-request';
import { CreateChargePointDto, UpdateChargePointDto } from '../dto/create-charge-point.dto';
import { CreateConnectorDto, UpdateConnectorDto } from '../dto/create-connector.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin/charge-points')
export class ChargePointsAdminController {
  constructor(private readonly cpService: ChargePointsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des bornes de recharge' })
  async findAll(@Req() req: CustomRequest) {
    const filters = req.filters || {};
    const result = await this.cpService.findAllAdmin(
      {
        status: req.query.status as ChargePointStatus,
        type: req.query.type as ChargePointType,
        search: filters.search,
      },
      req.pagination,
    );
    return { data: result };
  }

  @Get('map')
  @ApiOperation({ summary: 'Points cartographiques des bornes' })
  async getMap() {
    const points = await this.cpService.getMapPoints();
    return { data: points };
  }

  @Get(':id')
  @ApiOperation({ summary: "Détail d'une borne" })
  async findOne(@Param('id') id: string) {
    const cp = await this.cpService.findByIdAdmin(id);
    return { data: cp };
  }

  @Get(':id/telemetry')
  @ApiOperation({ summary: 'Télémétrie en direct de la borne' })
  async getTelemetry(@Param('id') id: string) {
    const telemetry = await this.cpService.getTelemetry(id);
    return { data: telemetry };
  }

  @Get(':id/sessions')
  @ApiOperation({ summary: 'Sessions de la borne' })
  async getSessions(@Param('id') id: string, @Req() req: CustomRequest) {
    const sessions = await this.cpService.getSessionsAdmin(id, req.pagination);
    return { data: sessions };
  }

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle borne' })
  async create(@Body() dto: CreateChargePointDto) {
    const cp = await this.cpService.create(dto);
    return { data: cp, message: 'Borne créée avec succès' };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une borne' })
  async update(@Param('id') id: string, @Body() dto: UpdateChargePointDto) {
    const cp = await this.cpService.update(id, dto);
    return { data: cp, message: 'Borne mise à jour' };
  }

  @Post(':id/remote-start')
  @ApiOperation({ summary: 'Commande RemoteStart' })
  async remoteStart(@Param('id') id: string) {
    const res = await this.cpService.remoteStart(id);
    return { data: res, message: 'Commande de démarrage envoyée' };
  }

  @Post(':id/remote-stop')
  @ApiOperation({ summary: 'Commande RemoteStop' })
  async remoteStop(@Param('id') id: string) {
    const res = await this.cpService.remoteStop(id);
    return { data: res, message: 'Commande d’arrêt envoyée' };
  }

  @Post(':id/connectors')
  @ApiOperation({ summary: 'Ajouter un connecteur' })
  async addConnector(
    @Param('id') id: string,
    @Body() dto: CreateConnectorDto,
  ) {
    const connector = await this.cpService.addConnector(id, dto);
    return { data: connector, message: 'Connecteur ajouté' };
  }

  @Patch(':id/connectors/:connectorId')
  @ApiOperation({ summary: 'Modifier un connecteur' })
  async updateConnector(
    @Param('id') id: string,
    @Param('connectorId', ParseIntPipe) connectorId: number,
    @Body() dto: UpdateConnectorDto,
  ) {
    const connector = await this.cpService.updateConnector(id, connectorId, dto);
    return { data: connector, message: 'Connecteur mis à jour' };
  }

  @Delete(':id/connectors/:connectorId')
  @ApiOperation({ summary: 'Supprimer un connecteur' })
  async deleteConnector(
    @Param('id') id: string,
    @Param('connectorId', ParseIntPipe) connectorId: number,
  ) {
    await this.cpService.deleteConnector(id, connectorId);
    return { data: null, message: 'Connecteur supprimé' };
  }
}
