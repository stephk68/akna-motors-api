import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../shared/services/prisma.service';
import { JwtPayload } from '../../shared/types/types';
import { Role } from '../../shared/types/enums';
import { AuthUserDto, TokenPairDto } from './dto/auth-response.dto';

interface RefreshPayload {
  sub: string;
  sid: string;
}

export interface RequestContext {
  userAgent?: string;
  ip?: string;
}

/**
 * Émission et rotation des tokens.
 *
 * Modèle retenu :
 *  - access token  : JWT court, porte `sid` (id de l'AuthSession) pour être
 *                    invalidable dès le logout ;
 *  - refresh token : JWT long, dont seul le HASH est stocké en base.
 *                    Chaque usage révoque la session courante et en crée une
 *                    nouvelle (rotation) : un token rejoué est donc détecté.
 */
@Injectable()
export class TokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private get accessTtl(): string {
    return this.config.get<string>('JWT_ACCESS_EXPIRATION') ?? '15m';
  }

  private get refreshTtl(): string {
    return this.config.get<string>('JWT_REFRESH_EXPIRATION') ?? '30d';
  }

  /** Convertit une durée type "15m" / "30d" / "3600" en secondes. */
  static parseDuration(value: string): number {
    const match = /^(\d+)([smhd])?$/.exec(value.trim());
    if (!match) {
      throw new Error(`Durée invalide : "${value}"`);
    }
    const amount = Number(match[1]);
    const unit = match[2] ?? 's';
    const factor = { s: 1, m: 60, h: 3600, d: 86400 }[unit] ?? 1;
    return amount * factor;
  }

  /** Crée une AuthSession et renvoie la paire de tokens associée. */
  async issue(user: User, ctx: RequestContext = {}): Promise<TokenPairDto> {
    // Durées converties en secondes : `expiresIn` typé `string` exigerait le
    // type littéral StringValue de `ms`, un nombre est accepté sans détour.
    const accessSeconds = TokenService.parseDuration(this.accessTtl);
    const refreshSeconds = TokenService.parseDuration(this.refreshTtl);

    // La session est créée d'abord : son id est embarqué dans les deux tokens.
    const session = await this.prisma.authSession.create({
      data: {
        userId: user.id,
        refreshHash: '', // renseigné juste après, une fois le token signé
        userAgent: ctx.userAgent?.slice(0, 255),
        ip: ctx.ip,
        expiresAt: new Date(Date.now() + refreshSeconds * 1000),
      },
    });

    const accessPayload: JwtPayload = {
      sub: user.id,
      phone: user.phone,
      email: user.email,
      role: user.role as unknown as Role,
      sid: session.id,
    };

    const accessToken = await this.jwt.signAsync(accessPayload, {
      expiresIn: accessSeconds,
    });

    const refreshToken = await this.jwt.signAsync(
      { sub: user.id, sid: session.id } satisfies RefreshPayload,
      { expiresIn: refreshSeconds },
    );

    await this.prisma.authSession.update({
      where: { id: session.id },
      data: { refreshHash: await bcrypt.hash(refreshToken, 10) },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: accessSeconds,
      user: TokenService.toAuthUser(user),
    };
  }

  /**
   * Vérifie un refresh token, révoque la session correspondante et en émet
   * une nouvelle. Toute anomalie (session inconnue, révoquée, expirée, hash
   * différent) renvoie la même erreur : on ne renseigne pas l'attaquant.
   */
  async rotate(refreshToken: string, ctx: RequestContext = {}): Promise<TokenPairDto> {
    let payload: RefreshPayload;
    try {
      payload = await this.jwt.verifyAsync<RefreshPayload>(refreshToken);
    } catch {
      throw new UnauthorizedException('Refresh token invalide ou expiré');
    }

    if (!payload.sid) {
      throw new UnauthorizedException('Refresh token invalide ou expiré');
    }

    const session = await this.prisma.authSession.findUnique({
      where: { id: payload.sid },
      include: { user: true },
    });

    if (
      !session ||
      session.revokedAt ||
      session.expiresAt.getTime() < Date.now() ||
      session.userId !== payload.sub
    ) {
      throw new UnauthorizedException('Refresh token invalide ou expiré');
    }

    if (!(await bcrypt.compare(refreshToken, session.refreshHash))) {
      // Token déjà tourné : on révoque toutes les sessions de l'utilisateur,
      // car cela signale un rejeu.
      await this.revokeAllForUser(session.userId);
      throw new UnauthorizedException('Refresh token invalide ou expiré');
    }

    await this.prisma.authSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    return this.issue(session.user, ctx);
  }

  async revoke(sessionId: string): Promise<void> {
    await this.prisma.authSession.updateMany({
      where: { id: sessionId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.authSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  static toAuthUser(user: User): AuthUserDto {
    return {
      id: user.id,
      phone: user.phone,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      kycStatus: user.kycStatus,
      plan: user.plan,
      locale: user.locale,
      organizationId: user.organizationId,
    };
  }
}
