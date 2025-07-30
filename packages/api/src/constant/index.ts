export const ENV = process.env.NODE_ENV ? process.env.NODE_ENV : 'local'

export enum DeployEnv {
  DEV = 'dev',
  PROD = 'production',
}
