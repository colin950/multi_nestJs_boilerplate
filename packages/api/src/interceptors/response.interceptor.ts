import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { Err } from '../errors/err'
import { IBaseResponse } from '../common/dto/baseResponse'

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, IBaseResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IBaseResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        error: Err.None,
        data,
      })),
    )
  }
}
