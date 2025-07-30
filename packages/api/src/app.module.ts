import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ConfigModule, ConfigService } from '@nestjs/config'

import appConfig from './config/app.config'
import { AppService } from './app.service'
import { LoggerMiddleware } from './middlerwares/logger.middleware'
import { AuthControllerModule } from './controllers/auth/auth.ctrl.module'
import { HealthCheckControllerModule } from './controllers/health/healthCheck.ctrl.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get('database.mongo.uri'),
        dbName: config.get('database.mongo.name'),
      }),
    }),
    AuthControllerModule,
    HealthCheckControllerModule,
  ],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(LoggerMiddleware)
      .exclude('/health') // 헬스체커만 제외
      .forRoutes({ path: '*', method: RequestMethod.ALL }) // 모든 경로
  }
}
