import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'

import { ErrStruct } from '../errors/err'
import apm from 'elastic-apm-node'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost

    const ctx = host.switchToHttp()
    const req = ctx.getRequest<Request>()
    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR

    const stack = exception.stack
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
      Logger.error({ url: req.url, error: errBody }, stack)
      apm.captureError(exception)
    }

    const responseBody = {
      error: errBody,
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus)
  }
}
