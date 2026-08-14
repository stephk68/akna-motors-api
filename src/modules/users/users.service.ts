import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../shared/services/prisma.service';
import { generateTemporaryPassword } from '../../shared/utilities/password';
import { PaginationService } from '../../shared/services/pagination.service';
import { MailService } from '../../shared/services/mail.service';
import { PaginationParams } from '../../shared/interfaces/pagination-params';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { Role, UserStatus, KycStatus, Plan } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationService: PaginationService,
    private readonly mailService: MailService,
  ) {}

  async findAllAdmin(
    filters: {
      role?: Role;
      kycStatus?: KycStatus;
      plan?: Plan;
      city?: string;
      search?: string;
    },
    pagination?: PaginationParams,
  ) {
    const where: any = {};

    if (filters.role) where.role = filters.role;
    if (filters.kycStatus) where.kycStatus = filters.kycStatus;
    if (filters.plan) where.plan = filters.plan;
    if (filters.city) where.city = { contains: filters.city, mode: 'insensitive' };

    if (filters.search) {
      where.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.paginationService.paginate(
      this.prisma.user,
      {
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          organization: { select: { id: true, name: true } },
          _count: { select: { vehicles: true, sessions: true } },
        },
      },
      pagination,
    );
  }

  async findByIdAdmin(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        organization: true,
        vehicles: true,
        wallet: true,
        _count: { select: { sessions: true, hostedPoints: true } },
      },
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur ${id} introuvable.`);
    }

    return user;
  }

  async createUser(dto: CreateUserDto) {
    const { password, ...rest } = dto;

    // Sans passwordHash, adminLogin s'arrête sur « Identifiants incorrects » :
    // l'invitation créait un compte impossible à utiliser, alors que l'e-mail
    // de bienvenue annonçait un mot de passe qui n'était jamais enregistré.
    const initialPassword = password ?? generateTemporaryPassword();

    const user = await this.prisma.user.create({
      data: {
        ...rest,
        // Le `default` de @ApiPropertyOptional ne documente que Swagger ; sans
        // valeur explicite c'est le défaut Prisma (PENDING) qui s'applique.
        status: rest.status ?? UserStatus.ACTIVE,
        passwordHash: await bcrypt.hash(initialPassword, 10),
      },
    });

    if (user.email) {
      await this.mailService.sendWelcomeEmail(
        user.email,
        user.firstName || 'Cher utilisateur',
        initialPassword,
        user.role,
      );
    }

    return user;
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    await this.findByIdAdmin(id);

    // `password` est hérité de CreateUserDto via PartialType mais n'existe pas
    // en base : le passer tel quel à Prisma ferait échouer la mise à jour.
    const { password, ...rest } = dto;

    return this.prisma.user.update({
      where: { id },
      data: {
        ...rest,
        ...(password
          ? { passwordHash: await bcrypt.hash(password, 10) }
          : {}),
      },
    });
  }

  /**
   * Réattribue un mot de passe et l'envoie par e-mail.
   *
   * Sert aux comptes créés avant que createUser ne pose un passwordHash :
   * ils existent en base mais sont refusés à la connexion, et aucune route
   * ne permettait de les débloquer.
   */
  async resetPasswordAdmin(id: string, password?: string) {
    const user = await this.findByIdAdmin(id);

    if (!user.email) {
      throw new BadRequestException(
        "Ce compte n'a pas d'adresse e-mail : impossible de lui transmettre un mot de passe.",
      );
    }

    const newPassword = password ?? generateTemporaryPassword();

    await this.prisma.user.update({
      where: { id },
      data: { passwordHash: await bcrypt.hash(newPassword, 10) },
    });

    const emailSent = await this.mailService.sendWelcomeEmail(
      user.email,
      user.firstName || 'Cher utilisateur',
      newPassword,
      user.role,
    );

    // Le mot de passe en clair n'est jamais renvoyé : il ne doit exister que
    // dans l'e-mail. `emailSent` à false signale un échec SMTP, auquel cas le
    // compte a bien un nouveau mot de passe que personne ne connaît.
    return { id: user.id, email: user.email, emailSent };
  }

  async updateRole(id: string, role: Role) {
    await this.findByIdAdmin(id);
    return this.prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  async updateStatus(id: string, status: UserStatus) {
    await this.findByIdAdmin(id);
    return this.prisma.user.update({
      where: { id },
      data: { status },
    });
  }

  async updateKyc(id: string, kycStatus: KycStatus) {
    await this.findByIdAdmin(id);
    return this.prisma.user.update({
      where: { id },
      data: { kycStatus },
    });
  }

  // Mobile
  async getProfileMobile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: true,
        vehicles: true,
        _count: { select: { sessions: true } },
      },
    });
    if (!user) {
      throw new NotFoundException(`Utilisateur ${userId} introuvable.`);
    }
    return user;
  }

  async updateProfileMobile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
  }

  async updatePreferencesMobile(userId: string, dto: UpdatePreferencesDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { locale: dto.locale },
    });
  }

  async registerDeviceMobile(userId: string, dto: RegisterDeviceDto) {
    return this.prisma.device.upsert({
      where: {
        userId_pushToken: {
          userId,
          pushToken: dto.pushToken || '',
        },
      },
      update: {
        platform: dto.platform,
        lastSeenAt: new Date(),
      },
      create: {
        userId,
        platform: dto.platform,
        pushToken: dto.pushToken,
        lastSeenAt: new Date(),
      },
    });
  }

  async removeDeviceMobile(userId: string, deviceId: string) {
    return this.prisma.device.deleteMany({
      where: {
        id: deviceId,
        userId,
      },
    });
  }
}
