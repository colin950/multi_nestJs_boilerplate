import {
  BeforeApplicationShutdown,
  INestApplication,
  Injectable,
  Logger,
} from '@nestjs/common'
import type { HttpTerminator } from 'http-terminator'
import { createHttpTerminator } from 'http-terminator'

const DEFAULT_SHUTDOWN_TIMEOUT = 5000

@Injectable()
export class AppService implements BeforeApplicationShutdown {
  private httpTerminator: HttpTerminator | null = null
  async beforeApplicationShutdown() {
    Logger.log('server is shutting down..')
    if (!this.httpTerminator) {
      throw new Error('httpTerminator is not initialized')
    }
    await this.httpTerminator.terminate()
  }

  setupGracefulShutdown(app: INestApplication, shutdownTimeout: number): void {
    this.httpTerminator = createHttpTerminator({
      gracefulTerminationTimeout: shutdownTimeout || DEFAULT_SHUTDOWN_TIMEOUT,
      server: app.getHttpServer(),
    })
  }
}
