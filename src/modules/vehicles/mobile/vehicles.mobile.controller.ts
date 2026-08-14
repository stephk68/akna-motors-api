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
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { VehiclesService } from '../vehicles.service';
import { CustomRequest } from '../../../shared/interfaces/custom-request';
import { CreateVehicleDto, UpdateVehicleDto } from '../dto/create-vehicle.dto';
import {
  ApiEnvelopeArrayResponse,
  ApiEnvelopeNullResponse,
  ApiEnvelopeResponse,
  ApiErrorResponseDto,
} from '../../../shared/dto/api-response.dto';
import { VehicleDto } from '../dto/vehicle-response.dto';

@ApiTags('mobile')
@ApiBearerAuth()
@Controller('mobile/vehicles')
export class VehiclesMobileController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  @ApiOperation({ summary: 'Mes véhicules' })
  @ApiEnvelopeArrayResponse(VehicleDto, {
    description:
      'Liste non paginée des véhicules de l’utilisateur, du plus récent au plus ancien.',
  })
  async findMyVehicles(@Req() req: CustomRequest) {
    const list = await this.vehiclesService.findAllMobile(req.user.id);
    return { data: list };
  }

  @Post()
  @ApiOperation({ summary: 'Ajouter un véhicule' })
  @ApiEnvelopeResponse(VehicleDto, {
    status: 201,
    description: 'Véhicule créé et rattaché à l’utilisateur courant.',
  })
  @ApiConflictResponse({
    type: ApiErrorResponseDto,
    description: '`vin` ou `obdSerial` déjà utilisé — les deux sont uniques.',
  })
  async create(@Req() req: CustomRequest, @Body() dto: CreateVehicleDto) {
    const vehicle = await this.vehiclesService.createMobile(req.user.id, dto);
    return { data: vehicle, message: 'Véhicule ajouté' };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un véhicule' })
  @ApiEnvelopeResponse(VehicleDto, {
    description: 'Véhicule après mise à jour.',
  })
  @ApiNotFoundResponse({
    type: ApiErrorResponseDto,
    description: 'Véhicule introuvable, ou n’appartenant pas à l’utilisateur.',
  })
  @ApiConflictResponse({
    type: ApiErrorResponseDto,
    description: '`vin` ou `obdSerial` déjà utilisé — les deux sont uniques.',
  })
  async update(
    @Req() req: CustomRequest,
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
  ) {
    const vehicle = await this.vehiclesService.updateMobile(req.user.id, id, dto);
    return { data: vehicle, message: 'Véhicule mis à jour' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un véhicule' })
  @ApiEnvelopeNullResponse({
    description: '`data` vaut null : la suppression ne renvoie aucun contenu.',
  })
  @ApiNotFoundResponse({
    type: ApiErrorResponseDto,
    description: 'Véhicule introuvable, ou n’appartenant pas à l’utilisateur.',
  })
  async delete(@Req() req: CustomRequest, @Param('id') id: string) {
    await this.vehiclesService.deleteMobile(req.user.id, id);
    return { data: null, message: 'Véhicule supprimé' };
  }
}
