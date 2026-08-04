import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Role, ChargePointType } from '@prisma/client';
import { TariffsService } from '../tariffs.service';
import { CustomRequest } from '../../../shared/interfaces/custom-request';
import { CreateTariffDto, UpdateTariffDto, SimulateTariffDto } from '../dto/create-tariff.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin/tariffs')
export class TariffsAdminController {
  constructor(private readonly tariffsService: TariffsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des règles tarifaires' })
  async findAll(@Req() req: CustomRequest) {
    const filters = req.filters || {};
    const result = await this.tariffsService.findAllAdmin(
      {
        active: req.query.active !== undefined ? req.query.active === 'true' : undefined,
        targetRole: req.query.targetRole as Role,
        chargePointType: req.query.chargePointType as ChargePointType,
        search: filters.search,
      },
      req.pagination,
    );
    return { data: result, message: 'Règles tarifaires récupérées' };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'une règle tarifaire' })
  async findOne(@Param('id') id: string) {
    const tariff = await this.tariffsService.findByIdAdmin(id);
    return { data: tariff };
  }

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle règle tarifaire' })
  async create(@Body() dto: CreateTariffDto) {
    const tariff = await this.tariffsService.create(dto);
    return { data: tariff, message: 'Règle tarifaire créée avec succès' };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une règle tarifaire' })
  async update(@Param('id') id: string, @Body() dto: UpdateTariffDto) {
    const tariff = await this.tariffsService.update(id, dto);
    return { data: tariff, message: 'Règle tarifaire mise à jour' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une règle tarifaire' })
  async delete(@Param('id') id: string) {
    await this.tariffsService.delete(id);
    return { data: null, message: 'Règle tarifaire supprimée' };
  }

  @Post('simulate')
  @ApiOperation({ summary: 'Simuler le coût d\'une recharge selon les règles' })
  async simulate(@Body() dto: SimulateTariffDto) {
    const res = await this.tariffsService.simulate(dto);
    return { data: res };
  }
}
