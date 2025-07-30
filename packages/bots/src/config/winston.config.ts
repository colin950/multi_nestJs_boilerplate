import { WinstonModule } from 'nest-winston'
import * as winston from 'winston'
import { SPLAT } from 'triple-beam'
import stringify from 'safe-stable-stringify'

const ENV = process.env.ENV ? process.env.ENV : 'local'
const { splat, combine, timestamp, printf, json, errors } = winston.format
const customFormat = printf((logData) => {
  const args = logData[SPLAT]
  let strArgs = ''
  if (logData.context) {
    strArgs += `, "context": "${logData.context}"`
  }
  if (logData.message && logData.message !== '') {
    strArgs += `, "message": "${logData.message}"`
  }
  if (args) {
    delete args[0].context
    const safeArgs = stringify(args[0])
    if (safeArgs !== '{}') {
      strArgs += `, "args": ${safeArgs}`
    }
  }

  return `{ "time": "${logData.timestamp}", "level": "${logData.level}"${strArgs} }`
})

export const winstonLogger = WinstonModule.createLogger({
  level: ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    splat(),
    json(),
    customFormat,
  ),
  transports: [new winston.transports.Console()],
})
