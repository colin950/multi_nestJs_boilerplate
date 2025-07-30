import { Body, Controller, Get, Post } from '@nestjs/common'
import { SchedulerService } from '../../scheduler/scheduler.service'
import { DtoRespGetScheduler } from './dto/scheduler.resp.dto'
import { DtoRespPostScheduler } from './dto/scheduler.req.dto'
import { ApiOperation } from '@nestjs/swagger'

@Controller('scheduler')
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @ApiOperation({ summary: 'get scheduler list info' })
  @Get('list')
  async getSchedulerList() {
    const jobs = await this.schedulerService.getSchedulerList()
    if (jobs.size < 1) {
      return []
    }
    return Array.from(jobs.entries()).map(([name, job]) => {
      const cronExpression =
        typeof job.cronTime.source === 'string'
          ? job.cronTime.source
          : String(job.cronTime.source)
      return new DtoRespGetScheduler({
        name: name,
        cronExpression: cronExpression,
        isRunning: job.running,
      })
    })
  }

  @ApiOperation({ summary: 'stop scheduler by jobName' })
  @Post('stop')
  async stopSchedulerByJob(@Body() bodyDto: DtoRespPostScheduler) {
    const job = this.schedulerService.closed(bodyDto.name)
    if (!job) {
      return
    }
    const cronExpression =
      typeof job.cronTime.source === 'string'
        ? job.cronTime.source
        : String(job.cronTime.source)
    return new DtoRespGetScheduler({
      name: bodyDto.name,
      cronExpression: cronExpression,
      isRunning: job.running,
    })
  }

  @ApiOperation({ summary: 'start scheduler by jobName' })
  @Post('start')
  async startSchedulerByJob(@Body() bodyDto: DtoRespPostScheduler) {
    const job = this.schedulerService.start(bodyDto.name)
    if (!job) {
      return
    }
    const cronExpression =
      typeof job.cronTime.source === 'string'
        ? job.cronTime.source
        : String(job.cronTime.source)
    return new DtoRespGetScheduler({
      name: bodyDto.name,
      cronExpression: cronExpression,
      isRunning: job.running,
    })
  }
}
