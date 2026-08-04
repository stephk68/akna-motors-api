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
import { VehiclesService } from '../vehicles.service';
import { CustomRequest } from '../../../shared/interfaces/custom-request';
import { CreateVehicleDto, UpdateVehicleDto } from '../dto/create-vehicle.dto';

@ApiTags('mobile')
@ApiBearerAuth()
@Controller('mobile/vehicles')
export class VehiclesMobileController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  @ApiOperation({ summary: 'Mes véhicules' })
  async findMyVehicles(@Req() req: CustomRequest) {
    const list = await this.vehiclesService.findAllMobile(req.user.id);
    return { data: list };
  }

  @Post()
  @ApiOperation({ summary: 'Ajouter un véhicule' })
  async create(@Req() req: CustomRequest, @Body() dto: CreateVehicleDto) {
    const vehicle = await this.vehiclesService.createMobile(req.user.id, dto);
    return { data: vehicle, message: 'Véhicule ajouté' };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un véhicule' })
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
  async delete(@Req() req: CustomRequest, @Param('id') id: string) {
    await this.vehiclesService.deleteMobile(req.user.id, id);
    return { data: null, message: 'Véhicule supprimé' };
  }
}
