import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { UsersService } from '../users.service';
import { CustomRequest } from '../../../shared/interfaces/custom-request';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UpdateRoleDto, UpdateStatusDto, UpdateKycDto } from '../dto/update-role.dto';
import { ResetUserPasswordDto } from '../dto/reset-user-password.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin/users')
export class UsersAdminController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Liste les utilisateurs (paginé, filtres)' })
  async findAll(@Req() req: CustomRequest) {
    const filters = req.filters || {};
    const result = await this.usersService.findAllAdmin(
      {
        role: filters.profileIds?.[0] as Role, // or query role
        search: filters.search,
      },
      req.pagination,
    );
    return { data: result, message: 'Liste des utilisateurs récupérée avec succès' };
  }

  @Get(':id')
  @ApiOperation({ summary: "Détails d'un utilisateur" })
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findByIdAdmin(id);
    return { data: user };
  }

  @Post()
  @ApiOperation({ summary: 'Créer un utilisateur' })
  async create(@Body() dto: CreateUserDto) {
    const user = await this.usersService.createUser(dto);
    return { data: user, message: 'Utilisateur créé avec succès' };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.updateUser(id, dto);
    return { data: user, message: 'Utilisateur mis à jour' };
  }

  @Post(':id/reset-password')
  @ApiOperation({
    summary: 'Réattribuer un mot de passe et l’envoyer par e-mail',
    description:
      'Pose un nouveau mot de passe et le transmet à l’utilisateur par e-mail. Le mot de passe n’est jamais renvoyé dans la réponse. Débloque notamment les comptes créés sans passwordHash.',
  })
  async resetPassword(
    @Param('id') id: string,
    @Body() dto: ResetUserPasswordDto,
  ) {
    const result = await this.usersService.resetPasswordAdmin(id, dto.password);
    return {
      data: result,
      message: result.emailSent
        ? 'Mot de passe réattribué et envoyé par e-mail'
        : 'Mot de passe réattribué, mais l’envoi de l’e-mail a échoué',
    };
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Changer le rôle' })
  async updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    const user = await this.usersService.updateRole(id, dto.role);
    return { data: user, message: 'Rôle mis à jour' };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Changer le statut' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    const user = await this.usersService.updateStatus(id, dto.status);
    return { data: user, message: 'Statut mis à jour' };
  }

  @Patch(':id/kyc')
  @ApiOperation({ summary: 'Mettre à jour le statut KYC' })
  async updateKyc(@Param('id') id: string, @Body() dto: UpdateKycDto) {
    const user = await this.usersService.updateKyc(id, dto.kycStatus);
    return { data: user, message: 'Statut KYC mis à jour' };
  }
}
