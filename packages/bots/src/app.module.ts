import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import appConfig from './config/app.config'
import { AppService } from './app.service'
import { LoggerMiddleware } from './middlerwares/logger.middleware'
import { ControllerModule } from './controllers/controller.module'
import { SchedulerModule } from './scheduler/scheduler.module'
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'

@Module({
  imports: [
    ConfigModule.forRoot({
      // envFilePath: `.env.${ENV}`,
      isGlobal: true,
      load: [appConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService): Promise<TypeOrmModuleOptions> => ({
        type: 'postgres',
        host: config.get<string>('database.postgres.host'),
        port: config.get<number>('database.postgres.port'),
        username: config.get<string>('database.postgres.username'),
        password: config.get<string>('database.postgres.password'),
        database: config.get<string>('database.postgres.name'),
        synchronize: process.env.NODE_ENV === 'dev',
        autoLoadEntities: true,
        namingStrategy: new SnakeNamingStrategy(),
        ssl: {
          rejectUnauthorized: false,
        },
      }),
    }),
    // controller
    ControllerModule,
    SchedulerModule,
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
