import { CronExpression } from '@nestjs/schedule'

const THROW_ERROR = undefined

function get<T>(key: string): T {
  return <T>process.env[key]
}

function getNumber(key: string, defaultVal: number): number {
  const v = process.env[key]
  if (v) {
    return parseInt(v)
  }
  if (isNaN(defaultVal)) {
    throw new Error(`Missing config: ${key}`)
  }

  return defaultVal
}

export default () => {
  const disableCommonScheduler =
    get<string>('EXCHANGE_RATE_IS_DISABLED') ?? 'true'

  return {
    port: get<number>('PORT') ?? 3000,
    shutdownTimeoutMs: get<number>('SHUTDOWN_TIMEOUT_MS') ?? 5000,
    database: {
      postgres: {
        host: get<string>('POSTGRES_DB_HOST') ?? 'localhost',
        port: get<string>('POSTGRES_DB_PORT') ?? '5432',
        username: get<string>('POSTGRES_DB_USERNAME') ?? '',
        password: get<string>('POSTGRES_DB_PASSWORD') ?? '',
        name: get<string>('POSTGRES_DB_NAME') ?? 'wallet',
      },
    },
    scheduler: {
      commonScheduler: {
        isDisabled: disableCommonScheduler,
        cronExpression:
          get<string>('COMMON_CRON_EXPRESSION') ??
          CronExpression.EVERY_2_HOURS,
      },
    },
  }
}
