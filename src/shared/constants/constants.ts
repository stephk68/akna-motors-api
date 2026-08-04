export const IS_PUBLIC_KEY = 'isPublic';
export const ROLES_KEY = 'roles';
export const PERMISSIONS_KEY = 'permissions';
export const CACHE_KEY_METADATA = 'cache_key';

export const DEFAULT_PAGE_SIZE = 20;

/**
 * Champs supprimés récursivement de toutes les réponses par
 * `transformResponseData` (voir shared/utilities/data-transformer).
 *
 * NB : `createdAt` / `updatedAt` NE sont volontairement PAS dans cette liste.
 * Les horodatages de sessions de recharge, paiements et factures sont des
 * données métier exposées aux clients web et mobile.
 *
 * NB : `refreshToken` non plus — c'est la valeur que /auth/* doit justement
 * renvoyer au client. Seul son hash en base (`refreshHash`) est secret.
 */
export const SENSITIVE_FIELDS = [
  'password',
  'passwordHash',
  'clearPassword',
  'otpCode',
  'codeHash',
  'refreshHash',
  'deletedAt',
];
