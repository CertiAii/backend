import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // If data already has the standard format, return it
        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          'message' in data &&
          'data' in data
        ) {
          return data;
        }

        // If data has a message field, use it
        const message = data?.message || 'Request successful';

        // Remove message from data if it exists
        const { message: _, ...restData } = data || {};

        return {
          success: true,
          message,
          data: Object.keys(restData).length > 0 ? restData : data,
        };
      }),
    );
  }
}
