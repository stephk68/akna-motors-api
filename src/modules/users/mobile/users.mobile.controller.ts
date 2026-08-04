import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Body,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../users.service';
import { CustomRequest } from '../../../shared/interfaces/custom-request';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpdatePreferencesDto } from '../dto/update-preferences.dto';
import { RegisterDeviceDto } from '../dto/register-device.dto';

@ApiTags('mobile')
@ApiBearerAuth()
@Controller('mobile')
export class UsersMobileController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: "Profil de l'utilisateur connecté" })
  async getProfile(@Req() req: CustomRequest) {
    const profile = await this.usersService.getProfileMobile(req.user.id);
    return { data: profile };
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Mettre à jour son profil' })
  async updateProfile(
    @Req() req: CustomRequest,
    @Body() dto: UpdateProfileDto,
  ) {
    const profile = await this.usersService.updateProfileMobile(
      req.user.id,
      dto,
    );
    return { data: profile, message: 'Profil mis à jour' };
  }

  @Patch('profile/preferences')
  @ApiOperation({ summary: 'Mettre à jour ses préférences (langue)' })
  async updatePreferences(
    @Req() req: CustomRequest,
    @Body() dto: UpdatePreferencesDto,
  ) {
    const profile = await this.usersService.updatePreferencesMobile(
      req.user.id,
      dto,
    );
    return { data: profile, message: 'Préférences mises à jour' };
  }

  @Post('devices')
  @ApiOperation({ summary: 'Enregistrer un appareil mobile (push token)' })
  async registerDevice(
    @Req() req: CustomRequest,
    @Body() dto: RegisterDeviceDto,
  ) {
    const device = await this.usersService.registerDeviceMobile(
      req.user.id,
      dto,
    );
    return { data: device, message: 'Appareil enregistré' };
  }

  @Delete('devices/:id')
  @ApiOperation({ summary: 'Supprimer un appareil mobile' })
  async removeDevice(@Req() req: CustomRequest, @Param('id') id: string) {
    await this.usersService.removeDeviceMobile(req.user.id, id);
    return { data: null, message: 'Appareil supprimé' };
  }
}
