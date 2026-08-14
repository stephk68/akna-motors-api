import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiNotFoundResponse } from '@nestjs/swagger';
import { ChargePointsService } from '../charge-points.service';
import { ChargePointType } from '@prisma/client';
import {
  ApiEnvelopeArrayResponse,
  ApiEnvelopeResponse,
  ApiErrorResponseDto,
} from '../../../shared/dto/api-response.dto';
import {
  StationDetailDto,
  StationListItemDto,
} from '../dto/station-response.dto';

@ApiTags('mobile')
@ApiBearerAuth()
@Controller('mobile/stations')
export class ChargePointsMobileController {
  constructor(private readonly cpService: ChargePointsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des stations pour le mobile' })
  @ApiEnvelopeArrayResponse(StationListItemDto, {
    description:
      'Liste non paginée. `distanceKm` n’est calculé que si `lat` et `lng` sont fournis, sinon null.',
  })
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
  @ApiEnvelopeArrayResponse(StationListItemDto, {
    description:
      'Trié par distance croissante et tronqué à `limit` (5 par défaut). Les stations sans distance calculable sont exclues, donc `distanceKm` est toujours renseigné ici.',
  })
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
  @ApiEnvelopeResponse(StationDetailDto, {
    description: 'Borne complète, connecteurs et tarif applicable inclus.',
  })
  @ApiNotFoundResponse({
    type: ApiErrorResponseDto,
    description: 'Station introuvable.',
  })
  async findOne(@Param('id') id: string) {
    const station = await this.cpService.findStationMobileDetail(id);
    return { data: station };
  }
}
