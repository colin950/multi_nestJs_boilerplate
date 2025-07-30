import { NestFactory, HttpAdapterHost } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { BadRequestException, ValidationPipe, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { AppModule } from './app.module'
import { IBaseResponse } from './common/dto/baseResponse'
import { AllExceptionsFilter } from './filters/exception.filter'
import { ResponseInterceptor } from './interceptors/response.interceptor'
import { Err } from './errors/err'
import { ENV } from './constant'
import { winstonLogger } from './config/winston.config'
import { AppService } from './app.service'
import * as process from 'process'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    forceCloseConnections: true,
    logger: winstonLogger,
  })

  app.enableShutdownHooks(['SIGINT', 'SIGTERM'])

  const appConf = app.get<ConfigService>(ConfigService)
  app.get(AppService).setupGracefulShutdown(app, appConf.get('shutdownTimeout'))

  const httpAdapter = app.get(HttpAdapterHost)
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter))
  app.useGlobalInterceptors(new ResponseInterceptor())
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: () => {
        return new BadRequestException(
          Err.InvalidParam,
          'failed to validate param',
        )
      },
    }),
  )
  const corsOptions = {
    credentials: true,
    exposedHeaders: ['set-cookie'],
    methods: ['GET', 'PUT', 'OPTIONS', 'POST', 'DELETE'],
  }

  const origins = process.env.CORS_ORIGINS?.split(',')
  if (origins != null && origins.length > 0) {
    if (origins[0] === '*') {
      Object.assign(corsOptions, { origin: true })
    } else {
      Object.assign(corsOptions, { origin: origins })
    }
  }
  app.enableCors(corsOptions)

  if (ENV !== 'production') {
    const apiDocConfig = new DocumentBuilder()
      .setTitle('event scheduler server')
      .setDescription('event scheduler server API')
      .setVersion('1.0')
      .build()

    const apiDoc = SwaggerModule.createDocument(app, apiDocConfig, {
      extraModels: [IBaseResponse],
    })
    SwaggerModule.setup('docs', app, apiDoc)
  }
  await app.listen(appConf.get('port'), '0.0.0.0', () => {
    Logger.log('listening on port ' + appConf.get('port'))
  })
}
bootstrap()
