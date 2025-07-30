export const ENV = process.env.ENV ? process.env.ENV : 'local'

export enum DeployEnv {
  DEV = 'dev',
  PROD = 'production',
}

export enum ServiceName {
  COMMON = 0,
}
