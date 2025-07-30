import { WinstonModule } from 'nest-winston'
import * as winston from 'winston'
import { SPLAT } from 'triple-beam'
import jsonStr from 'fast-json-stable-stringify'
import { DeployEnv, ENV } from '../constant'

const { splat, combine, timestamp, printf, prettyPrint, json } = winston.format
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
    if (Object.keys(args[0]).length !== 0) {
      strArgs += `, "args": ${jsonStr(args[0])}`
    }
  }

  return `{ "time": "${logData.timestamp}", "level": "${logData.level}"${strArgs} }`
})

export const winstonLogger = WinstonModule.createLogger({
  level: ENV === DeployEnv.PROD ? 'info' : 'debug',
  format: combine(
    json(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    splat(),
    prettyPrint(),
    customFormat,
  ),
  transports: [new winston.transports.Console()],
})
