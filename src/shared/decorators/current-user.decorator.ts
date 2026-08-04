import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CustomRequest } from '../interfaces/custom-request';
import { UserPayload } from '../types/types';

/**
 * Injecte l'utilisateur authentifié résolu par la JwtStrategy.
 *
 *   findMine(@CurrentUser() user: UserPayload) { ... }
 *   findMine(@CurrentUser('id') userId: string) { ... }
 */
export const CurrentUser = createParamDecorator(
  (field: keyof UserPayload | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<CustomRequest>();
    const user = request.user;

    if (!user) {
      return undefined;
    }

    return field ? user[field] : user;
  },
);
