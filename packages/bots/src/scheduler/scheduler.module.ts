import { ScheduleModule } from '@nestjs/schedule'
import { Module } from '@nestjs/common'
import { SchedulerService } from './scheduler.service'
import { ClientModule } from '../client/client.module'
import { SlackModule } from '@libs/slack/slack.module'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ClientModule,
    SlackModule,
  ],
  providers: [
    SchedulerService,
  ],
  exports: [SchedulerService],
})
export class SchedulerModule {}
