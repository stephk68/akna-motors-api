import { Role } from './enums';

/**
 * Contenu du JWT d'accès signé par le module Auth.
 * `sub` = User.id, `role` = miroir de l'enum Prisma Role.
 */
export interface JwtPayload {
  sub: string;
  phone: string;
  email?: string | null;
  role: Role;
  /** Identifiant de l'AuthSession, pour permettre la révocation. */
  sid?: string;
  permissions?: string[];
  iat?: number;
  exp?: number;
}

/**
 * Utilisateur résolu par la JwtStrategy et attaché à `req.user`.
 */
export interface UserPayload {
  id: string;
  phone: string;
  email?: string | null;
  role: Role;
  organizationId?: string | null;
  sessionId?: string;
  permissions?: string[];
}
