import { Module } from '@nestjs/common'
import { TerminusModule } from '@nestjs/terminus'

import { HealthCheckController } from './healthCheck.controller'

@Module({
  imports: [TerminusModule],
  controllers: [HealthCheckController],
})
export class HealthCheckControllerModule {}
