import { Injectable } from '@nestjs/common';

@Injectable()
export class CacheService {
  private cache = new Map<string, { value: any; expiresAt?: number }>();

  get<T = any>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (item.expiresAt && item.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return item.value as T;
  }

  set(key: string, value: any, ttlSeconds?: number): void {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    this.cache.set(key, { value, expiresAt });
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}
