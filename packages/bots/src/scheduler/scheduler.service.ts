import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'
import { SchedulerRegistry } from '@nestjs/schedule'
import { CronJob } from 'cron'
import { ConfigService } from '@nestjs/config'
import { SchedulerJobName } from '../constant/enum'
import { SlackColor } from '@libs/constant'
import { CommonSchedulerHandler } from './handlers/commonScheduler.handler'
import { SlackService } from '@libs/slack/slack.service'

@Injectable()
export class SchedulerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SchedulerService.name)
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private readonly configService: ConfigService,
    private readonly commonSchedulerHandler: CommonSchedulerHandler,
    private readonly slackService: SlackService,
  ) {}

  async onApplicationBootstrap() {
    await this.registerCommonScheduler()
  }

  async registerCommonScheduler() {
    this.logger.log(`push currency(moca) price message handler registered`)
    this.commonHandleCron(
      SchedulerJobName.CommonScheduler,
      this.configService.get<string>(
        'scheduler.commonScheduler.cronExpression',
      ),
      this.configService.get<string>('scheduler.commonScheduler.isDisabled') ==
        'true',
      this.commonSchedulerHandler.runTask.bind(
        this.commonSchedulerHandler,
      ),
      1,
    )
  }

  /**
   * Scheduler 등록 API
   * @param jobName
   * @param expression
   * @param isDisabled
   * @param callback
   * @param maxRetryAttempts
   */
  commonHandleCron(
    jobName: string,
    expression: string,
    isDisabled: boolean,
    callback: () => Promise<void>,
    maxRetryAttempts: number = 3,
  ) {
    const cronJob = new CronJob(
      expression,
      async () => {
        let attempt = 0
        const maxAttempts = maxRetryAttempts

        while (attempt < maxAttempts) {
          try {
            attempt++
            await callback()
            if (attempt > 1) {
              this.logger.warn(
                `[${jobName}] retry success (after ${attempt} attempts)`,
              )
            }
            break // 성공하면 while 탈출
          } catch (err) {
            await this.slackService.sendErrorMessageSlack(
              SlackColor.Danger,
              jobName,
              {
                attempt,
                name: String(
                  err?.response?.name || err?.name || 'Unknown name',
                ),
                message: String(
                  err?.response?.message ??
                    err?.response?.text ??
                    err?.message ??
                    'Unknown message',
                ),
                code: String(err?.response?.code ?? 'Unknown code'),
                stack: String(err?.stack || 'No stack trace available'),
              },
            )
            if (
              !['zerionApi', 'coingeckoApi'].includes(err?.response?.source)
            ) {
              break
            }
            this.logger.error(
              `[${jobName}] error, attempt: ${attempt}`,
              err.stack,
            )

            if (attempt >= maxAttempts) {
              break
            }

            // 재시도 전 약간 딜레이 줄 수도 있어
            await this.sleep(60000) // 1분 대기
          }
        }
      },
      null,
      !isDisabled,
    )

    this.logger.log(
      `[Scheduler] jobName: ${jobName}, expression: ${expression}, isDisabled: ${isDisabled}`,
    )
    this.schedulerRegistry.addCronJob(jobName, cronJob)
  }
  /**
   * Scheduler 종료 API
   * @param jobName
   */
  closed(jobName: string) {
    const taskJob = this.schedulerRegistry.getCronJob(jobName)
    if (!taskJob) {
      Logger.error(`[Scheduler] jobName: ${jobName} does not exist`)
      return
    }
    taskJob.stop()
    Logger.log(`[Scheduler] jobName: ${jobName} is closed`)
    return taskJob
  }
  /**
   * Scheduler 시작 API
   * @param jobName
   */
  start(jobName: string) {
    const taskJob = this.schedulerRegistry.getCronJob(jobName)
    if (!taskJob) {
      Logger.error(`[Scheduler] jobName: ${jobName} does not exist`)
      return
    }
    taskJob.start()
    Logger.log(`[Scheduler] jobName: ${jobName} is started`)
    return taskJob
  }
  /**
   * Scheduler interval API
   * @param milliseconds
   */
  sleep(milliseconds: number) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds))
  }

  getSchedulerList() {
    return this.schedulerRegistry.getCronJobs()
  }
}
