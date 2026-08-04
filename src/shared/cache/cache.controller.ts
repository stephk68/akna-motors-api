import { Controller, Delete, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CacheService } from './cache.service';
import { Roles } from '../decorators';
import { Role } from '../types/enums';

/**
 * Endpoints d'exploitation du cache.
 * Réservés aux ADMIN : vider le cache en production est une action de
 * maintenance, pas une opération ouverte.
 */
@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin/cache')
export class CacheController {
  constructor(private readonly cacheService: CacheService) {}

  @Delete('clear')
  @ApiOperation({ summary: 'Vider entièrement le cache applicatif' })
  clearCache() {
    this.cacheService.clear();
    return { data: null, message: 'Cache vidé avec succès' };
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Supprimer une clé de cache' })
  deleteKey(@Param('key') key: string) {
    const deleted = this.cacheService.delete(key);
    return { data: { key, deleted }, message: 'Clé de cache supprimée' };
  }
}
