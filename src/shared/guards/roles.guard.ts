import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../constants/constants';
import { Role } from '../types/enums';
import { CustomRequest } from '../interfaces/custom-request';

/**
 * Applique le décorateur `@Roles(...)`.
 *
 * Enregistré en APP_GUARD APRÈS JwtAuthGuard : `req.user` est donc déjà résolu
 * quand ce guard s'exécute. Une route sans `@Roles()` reste accessible à tout
 * utilisateur authentifié.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<(Role | string)[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<CustomRequest>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Accès refusé : utilisateur non authentifié');
    }

    if (!required.includes(user.role)) {
      throw new ForbiddenException(
        `Accès refusé : rôle requis (${required.join(', ')})`,
      );
    }

    return true;
  }
}
