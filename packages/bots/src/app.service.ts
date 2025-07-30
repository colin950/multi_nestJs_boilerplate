import {
  BeforeApplicationShutdown,
  INestApplication,
  Injectable,
  Logger,
} from '@nestjs/common'
import type { HttpTerminator } from 'http-terminator'
import { createHttpTerminator } from 'http-terminator'
import { SchedulerService } from './scheduler/scheduler.service'
import { sleep } from './common/util'

const DEFAULT_SHUTDOWN_TIMEOUT = 5000

@Injectable()
export class AppService implements BeforeApplicationShutdown {
  private httpTerminator: HttpTerminator | null = null
  private shutdownTimeout: number
  constructor(private schedulerService: SchedulerService) {}
  async beforeApplicationShutdown() {
    const schedulers = this.schedulerService.getSchedulerList()
    schedulers.forEach((schedule, name) => this.schedulerService.closed(name))

    Logger.log('server is shutting down..')
    if (!this.httpTerminator) {
      throw new Error('httpTerminator is not initialized')
    }
    await this.httpTerminator.terminate()

    // graceful shutdown for bots
    await sleep(this.shutdownTimeout)
  }

  setupGracefulShutdown(app: INestApplication, shutdownTimeout: number): void {
    this.shutdownTimeout = shutdownTimeout || DEFAULT_SHUTDOWN_TIMEOUT
    this.httpTerminator = createHttpTerminator({
      gracefulTerminationTimeout: shutdownTimeout || DEFAULT_SHUTDOWN_TIMEOUT,
      server: app.getHttpServer(),
    })
  }
}
