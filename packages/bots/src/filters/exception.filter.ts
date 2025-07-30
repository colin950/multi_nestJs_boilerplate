import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'

import { ErrStruct } from '../errors/err'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost

    const ctx = host.switchToHttp()

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR

    let errBody =
      exception instanceof HttpException ? exception.getResponse() : 'unknown'

    if (errBody === 'unknown') {
      let err: ErrStruct
      if (exception.message.error != null) {
        err = new ErrStruct(
          1000,
          'internal server err',
          exception.message.error,
        )
      } else {
        err = new ErrStruct(1000, exception.name, exception.message)
      }
      err.setDetail('')
      errBody = err
    }

    const responseBody = {
      error: errBody,
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus)
  }
}
