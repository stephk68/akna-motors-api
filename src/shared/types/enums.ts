/**
 * Enums transverses.
 *
 * `Role` est le miroir exact de l'enum `Role` de prisma/schema.prisma.
 * Il est redéclaré ici pour que les décorateurs et guards du dossier `shared`
 * ne dépendent pas du client Prisma généré.
 * Toute modification du schéma doit être répercutée ici.
 */
export enum Role {
  PARTICULIER = 'PARTICULIER',
  ENTREPRISE = 'ENTREPRISE',
  HOST = 'HOST',
  TECHNICIEN = 'TECHNICIEN',
  ADMIN = 'ADMIN',
}

export enum Permission {
  READ = 'READ',
  WRITE = 'WRITE',
  DELETE = 'DELETE',
  MANAGE = 'MANAGE',
}
