import { Injectable, OnApplicationShutdown, Logger } from '@nestjs/common';

@Injectable()
export class LifecycleService implements OnApplicationShutdown {
  private readonly logger = new Logger(LifecycleService.name);

  onApplicationShutdown(signal?: string) {
    this.logger.log(`Application is shutting down with signal: ${signal || 'UNKNOWN'}`);
  }
}
