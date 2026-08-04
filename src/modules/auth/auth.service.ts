import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { OtpPurpose, Role, User, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../shared/services/prisma.service';
import { RequestContext, TokenService } from './token.service';
import { OtpService } from './otp.service';
import {
  AdminLoginDto,
  ForgotPasswordDto,
  MobileRegisterDto,
  RequestOtpDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import {
  AuthUserDto,
  ChallengeDto,
  MobileAuthDto,
  TokenPairDto,
} from './dto/auth-response.dto';

/** Rôles autorisés à se connecter au portail back-office. */
const BACKOFFICE_ROLES: Role[] = [Role.ADMIN, Role.TECHNICIEN, Role.HOST];

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: TokenService,
    private readonly otp: OtpService,
  ) {}

  /* ---------------------------------------------------------------- */
  /*  Portail admin : mot de passe puis 2FA                            */
  /* ---------------------------------------------------------------- */

  async adminLogin(dto: AdminLoginDto): Promise<ChallengeDto> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    // Message identique que l'email soit inconnu ou le mot de passe faux :
    // on n'indique pas quels comptes existent.
    const invalid = new UnauthorizedException('Identifiants incorrects');

    if (!user?.passwordHash) throw invalid;
    if (!(await bcrypt.compare(dto.password, user.passwordHash))) throw invalid;
    if (!BACKOFFICE_ROLES.includes(user.role)) throw invalid;

    this.assertActive(user);

    return this.otp.create(OtpPurpose.ADMIN_2FA, { email: user.email ?? undefined });
  }

  async verifyAdmin2fa(
    challengeId: string,
    code: string,
    ctx: RequestContext,
  ): Promise<TokenPairDto> {
    const challenge = await this.otp.consume(challengeId, code, OtpPurpose.ADMIN_2FA);

    if (!challenge.email) {
      throw new UnauthorizedException('Défi invalide');
    }

    const user = await this.prisma.user.findUnique({ where: { email: challenge.email } });
    if (!user) throw new UnauthorizedException('Défi invalide');

    this.assertActive(user);

    return this.tokens.issue(user, ctx);
  }

  /* ---------------------------------------------------------------- */
  /*  Mobile : OTP par SMS sur le numéro de téléphone                  */
  /* ---------------------------------------------------------------- */

  async requestOtp(dto: RequestOtpDto): Promise<ChallengeDto> {
    // Aucune vérification d'existence : un numéro inconnu crée un compte à la
    // vérification. Cela évite aussi d'exposer quels numéros sont inscrits.
    return this.otp.create(OtpPurpose.MOBILE_LOGIN, { phone: dto.phone });
  }

  async verifyOtp(
    challengeId: string,
    code: string,
    ctx: RequestContext,
  ): Promise<MobileAuthDto> {
    const challenge = await this.otp.consume(challengeId, code, OtpPurpose.MOBILE_LOGIN);

    if (!challenge.phone) {
      throw new UnauthorizedException('Défi invalide');
    }

    const existing = await this.prisma.user.findUnique({ where: { phone: challenge.phone } });
    const isNewUser = !existing;

    let user =
      existing ??
      (await this.prisma.user.create({
        data: {
          phone: challenge.phone,
          role: Role.PARTICULIER,
          status: UserStatus.ACTIVE,
          wallet: { create: {} },
        },
      }));

    this.assertActive(user);

    // La vérification du code prouve la possession du numéro : un compte créé
    // par /register (statut PENDING) devient actif ici.
    if (user.status === UserStatus.PENDING) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { status: UserStatus.ACTIVE },
      });
    }

    const pair = await this.tokens.issue(user, ctx);
    return { ...pair, isNewUser };
  }

  async registerMobile(dto: MobileRegisterDto): Promise<ChallengeDto> {
    const existing = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (existing) {
      throw new ConflictException('Ce numéro est déjà associé à un compte');
    }

    if (dto.email) {
      const emailTaken = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (emailTaken) {
        throw new ConflictException('Cette adresse email est déjà utilisée');
      }
    }

    // Le compte est créé en PENDING : il ne devient ACTIVE qu'après
    // vérification du code, ce qui prouve la possession du numéro.
    await this.prisma.user.create({
      data: {
        phone: dto.phone,
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        locale: dto.locale ?? 'fr',
        role: Role.PARTICULIER,
        status: UserStatus.PENDING,
        wallet: { create: {} },
      },
    });

    return this.otp.create(OtpPurpose.MOBILE_LOGIN, { phone: dto.phone });
  }

  /* ---------------------------------------------------------------- */
  /*  Commun                                                           */
  /* ---------------------------------------------------------------- */

  async refresh(refreshToken: string, ctx: RequestContext): Promise<TokenPairDto> {
    return this.tokens.rotate(refreshToken, ctx);
  }

  async logout(sessionId?: string): Promise<void> {
    if (sessionId) {
      await this.tokens.revoke(sessionId);
    }
  }

  async me(userId: string): Promise<AuthUserDto> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }
    return TokenService.toAuthUser(user);
  }

  /* ---------------------------------------------------------------- */
  /*  Mot de passe oublié (portail admin)                              */
  /* ---------------------------------------------------------------- */

  async forgotPassword(dto: ForgotPasswordDto): Promise<ChallengeDto> {
    // Un défi est toujours créé, même pour un email inconnu : sinon la réponse
    // révélerait l'existence du compte.
    return this.otp.create(OtpPurpose.PASSWORD_RESET, { email: dto.email });
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const challenge = await this.otp.consume(
      dto.challengeId,
      dto.code,
      OtpPurpose.PASSWORD_RESET,
    );

    if (!challenge.email) {
      throw new BadRequestException('Défi invalide');
    }

    const user = await this.prisma.user.findUnique({ where: { email: challenge.email } });
    if (!user) {
      throw new BadRequestException('Défi invalide');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await bcrypt.hash(dto.newPassword, 10) },
    });

    // Changer de mot de passe déconnecte tous les appareils.
    await this.tokens.revokeAllForUser(user.id);
  }

  private assertActive(user: User): void {
    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('Compte suspendu, contactez le support');
    }
  }
}
