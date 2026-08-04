import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { StandardResponse } from '../interceptors/response.interceptor';

/**
 * Filtre global : garantit que les réponses d'ERREUR utilisent exactement la
 * même enveloppe que les réponses de succès produites par ResponseInterceptor.
 *
 * Sans ce filtre, Nest renvoie sa forme par défaut ({statusCode, message, error})
 * et le client doit gérer deux contrats différents.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = this.extractMessage(exception, statusCode);

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        message,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    const body: StandardResponse<null> = {
      error: true,
      statusCode,
      message,
      data: null,
    };

    response.status(statusCode).json(body);
  }

  private extractMessage(exception: unknown, statusCode: number): string {
    if (exception instanceof HttpException) {
      const payload = exception.getResponse();

      if (typeof payload === 'string') {
        return payload;
      }

      if (payload && typeof payload === 'object') {
        const { message } = payload as { message?: string | string[] };
        // ValidationPipe renvoie un tableau de messages : on le concatène.
        if (Array.isArray(message)) {
          return message.join(' | ');
        }
        if (typeof message === 'string') {
          return message;
        }
      }

      return exception.message;
    }

    if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      return 'Une erreur interne est survenue';
    }

    return exception instanceof Error ? exception.message : 'Erreur inconnue';
  }
}
