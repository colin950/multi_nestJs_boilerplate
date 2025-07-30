import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import requestIp from 'request-ip'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const begin = Date.now()
    res.on('finish', () => {
      const messages = {
        ip: this.parseIp(req),
        statusCode: res.statusCode,
        method: req.method,
        url: req.url,
        duration: Date.now() - begin,
        params: req.params,
        query: req.query,
        body: req.body,
      }
      Logger.log(messages, 'tracking')
    })
    next()
  }
  parseIp(req: Request): string {
    const clientIp = requestIp.getClientIp(req)
    return clientIp ?? ''
  }
}
