import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChargePointsService } from '../charge-points.service';
import { ChargePointType } from '@prisma/client';

@ApiTags('mobile')
@ApiBearerAuth()
@Controller('mobile/stations')
export class ChargePointsMobileController {
  constructor(private readonly cpService: ChargePointsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des stations pour le mobile' })
  async findStations(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radiusKm') radiusKm?: string,
    @Query('type') type?: ChargePointType,
    @Query('availableOnly') availableOnly?: string,
    @Query('search') search?: string,
  ) {
    const stations = await this.cpService.findStationsMobile({
      lat: lat ? parseFloat(lat) : undefined,
      lng: lng ? parseFloat(lng) : undefined,
      radiusKm: radiusKm ? parseFloat(radiusKm) : undefined,
      type,
      availableOnly: availableOnly === 'true',
      search,
    });
    return { data: stations };
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Stations les plus proches' })
  async findNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('limit') limit?: string,
  ) {
    const stations = await this.cpService.findStationsMobile({
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      search: undefined,
    });

    const maxLimit = limit ? parseInt(limit, 10) : 5;
    const sorted = stations
      .filter((s) => s.distanceKm !== null)
      .sort((a, b) => (a.distanceKm! > b.distanceKm! ? 1 : -1))
      .slice(0, maxLimit);

    return { data: sorted };
  }

  @Get(':id')
  @ApiOperation({ summary: "Détails d'une station pour le mobile" })
  async findOne(@Param('id') id: string) {
    const station = await this.cpService.findStationMobileDetail(id);
    return { data: station };
  }
}
