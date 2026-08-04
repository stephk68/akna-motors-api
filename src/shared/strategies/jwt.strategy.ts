import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserStatus } from '@prisma/client';
import { PrismaService } from '../services/prisma.service';
import { JwtPayload, UserPayload } from '../types/types';
import { Role } from '../types/enums';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const secret = config.get<string>('JWT_SECRET');

    // Aucun secret par défaut : mieux vaut refuser de démarrer que signer
    // des tokens avec une valeur connue publiquement.
    if (!secret) {
      throw new Error(
        'JWT_SECRET est absent de la configuration. Renseignez-le dans .env.',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /**
   * Le payload seul ne suffit pas : on relit l'utilisateur en base pour
   * refuser les tokens d'un compte supprimé ou suspendu, et pour prendre en
   * compte un changement de rôle sans attendre l'expiration du token.
   */
  async validate(payload: JwtPayload): Promise<UserPayload> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        phone: true,
        email: true,
        role: true,
        status: true,
        organizationId: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('Compte suspendu');
    }

    // Un refresh token révoqué (logout) invalide aussi les accès émis avec lui.
    if (payload.sid) {
      const session = await this.prisma.authSession.findUnique({
        where: { id: payload.sid },
        select: { revokedAt: true },
      });

      if (session?.revokedAt) {
        throw new UnauthorizedException('Session révoquée');
      }
    }

    return {
      id: user.id,
      phone: user.phone,
      email: user.email,
      role: user.role as unknown as Role,
      organizationId: user.organizationId,
      sessionId: payload.sid,
      permissions: payload.permissions,
    };
  }
}
