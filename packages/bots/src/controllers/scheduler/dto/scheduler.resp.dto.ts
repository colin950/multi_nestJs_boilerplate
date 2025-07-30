import { ApiProperty } from '@nestjs/swagger'

export class DtoRespGetScheduler {
  constructor(init?: Partial<DtoRespGetScheduler>) {
    Object.assign(this, init)
  }
  @ApiProperty({ description: 'job name' })
  name: string

  @ApiProperty({ description: 'running' })
  isRunning: boolean

  @ApiProperty({ description: 'cron expression time' })
  cronExpression: string
}
