import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { transformResponseData } from '../utilities/data-transformer';

export interface StandardResponse<T> {
  error: boolean;
  statusCode: number;
  message: string;
  data: T | null;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, StandardResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<T>> {
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode || 200;

    return next.handle().pipe(
      map((res) => {
        let message = 'Success';
        let rawData = res;

        if (res && typeof res === 'object' && 'data' in res) {
          rawData = res.data;
          if (res.message) {
            message = res.message;
          }
        }

        const cleanedData = transformResponseData(rawData);

        return {
          error: false,
          statusCode,
          message,
          data: cleanedData !== undefined ? cleanedData : null,
        };
      }),
    );
  }
}
