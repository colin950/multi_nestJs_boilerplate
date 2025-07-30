if (process.env.ELASTIC_APM_SERVICE_NAME) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('elastic-apm-node').start({
    serviceName: process.env.ELASTIC_APM_SERVICE_NAME,
    secretToken: process.env.ELASTIC_APM_SECRET_TOKEN,
    serverUrl: process.env.ELASTIC_APM_SERVER_URL,
    environment: process.env.ELASTIC_APM_ENVIRONMENT,
    active: process.env.ELASTIC_APM_ACTIVE == 'true', // apm 기능 사용하지 않을 경우 false
    transactionSampleRate: 1.0, // transaction 기록 비율 0.0 ~ 1.0
    captureErrorLogStackTraces: 'messages',
    captureBody: 'all', // 요청 값 지정 level(all, transaction, error ...)
    // ignoreUrls: ['/health'], // apm 수집 제외 요청 url
    logLevel: 'info',
    // spanFramesMinDuration: 5, // 5ms 미만으로 실행되는 스팬은 스택 트레이스를 캡처하지 않음
    // sanitizeFieldNames: ['password', 'secret'], // 민감한 정보를 포함할 수 있는 필드 이름
  })
}

import { NestFactory, HttpAdapterHost } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { BadRequestException, ValidationPipe, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import cookieParser from 'cookie-parser'

import { AppModule } from './app.module'
import { IBaseResponse } from './common/dto/baseResponse'
import { AllExceptionsFilter } from './filters/exception.filter'
import { ResponseInterceptor } from './interceptors/response.interceptor'
import { Err } from './errors/err'
import { DeployEnv } from './constant'
import { winstonLogger } from './config/winston.config'
import { AppService } from './app.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    forceCloseConnections: true,
    logger: winstonLogger,
  })

  app.enableShutdownHooks(['SIGINT', 'SIGTERM'])

  const appConf = app.get<ConfigService>(ConfigService)
  app.get(AppService).setupGracefulShutdown(app, appConf.get('shutdownTimeout'))
  app.use(cookieParser())

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

  const corsOriginRaw = appConf.get<string>('corsOrigins')
  const origins = corsOriginRaw.split(',')
  if (origins.length > 0) {
    if (origins.includes('*')) {
      Object.assign(corsOptions, { origin: true })
    } else {
      Object.assign(corsOptions, { origin: origins })
    }
  }
  app.enableCors(corsOptions)

  if (process.env.NODE_ENV !== DeployEnv.PROD) {
    const apiDocConfig = new DocumentBuilder()
      .setTitle('web backend boilerplate')
      .setDescription('web backend boilerplate API')
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
