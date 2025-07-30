import type { Config } from 'jest'

const config: Config = {
  testEnvironment: 'node',
  rootDir: './src',
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: {
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          module: 'ESNext',
          target: 'ESNext',
        },
      },
    ],
  },
  testRegex: '.*\\.spec\\.ts$',
  collectCoverageFrom: ['**/*.(t|j)s'],
}

export default config
