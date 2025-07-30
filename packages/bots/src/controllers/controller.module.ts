import { Module } from '@nestjs/common'
import { TerminusModule } from '@nestjs/terminus'
import { HealthCheckController } from './health/healthCheck.controller'
import { SchedulerController } from './scheduler/scheduler.controller'
import { SchedulerModule } from '../scheduler/scheduler.module'

@Module({
  imports: [TerminusModule, SchedulerModule],
  controllers: [HealthCheckController, SchedulerController],
})
export class ControllerModule {}
