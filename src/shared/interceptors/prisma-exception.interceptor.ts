import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaExceptionInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PrismaExceptionInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          this.logger.error(`Prisma Error Code: ${error.code}`, error.message);

          switch (error.code) {
            case 'P2002': {
              const target = (error.meta?.target as string[]) || [];
              const fields = target.join(', ');
              return throwError(
                () =>
                  new HttpException(
                    `Une contrainte d'unicité a été violée${fields ? ` sur (${fields})` : ''}.`,
                    HttpStatus.CONFLICT,
                  ),
              );
            }
            case 'P2025': {
              return throwError(
                () =>
                  new HttpException(
                    "L'enregistrement demandé n'existe pas ou a été supprimé.",
                    HttpStatus.NOT_FOUND,
                  ),
              );
            }
            case 'P2003': {
              return throwError(
                () =>
                  new HttpException(
                    'Violation de contrainte de clé étrangère.',
                    HttpStatus.BAD_REQUEST,
                  ),
              );
            }
            case 'P2000':
            case 'P2004':
            case 'P2005':
            case 'P2006':
            case 'P2011': {
              return throwError(
                () =>
                  new HttpException(
                    'La valeur fournie est invalide pour ce champ.',
                    HttpStatus.BAD_REQUEST,
                  ),
              );
            }
            default: {
              return throwError(
                () =>
                  new HttpException(
                    'Erreur technique de la base de données.',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                  ),
              );
            }
          }
        }

        return throwError(() => error);
      }),
    );
  }
}
