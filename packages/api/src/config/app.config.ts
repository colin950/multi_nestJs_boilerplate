import { BlockChainSetting } from './interface/app.interface'

function get<T>(key: string): T {
  return <T>process.env[key]
}

export default () => ({
  corsOrigins: get<string>('CORS_ORIGIN') ?? '*',
  database: {
    mongo: {
      name: get<string>('MONGO_DB_NAME') ?? 'myapp',
      uri: get<string>('MONGO_URI') ?? 'mongodb://localhost:27017/',
    },
  },
  port: get<number>('PORT') ?? 3002,
  shutdownTimeoutMs: get<number>('SHUTDOWN_TIMEOUT_MS') ?? 5000,
  networks: getNetwork(),
})

function getNetwork(): Map<string, BlockChainSetting> {
  const ethereumSetting = {
    networkName: 'ethereumNetworkName',
    endpoint: get<string>('ethereum_endpoint'),
    chainId: get<number>('ethereum_chain_id'),
    maxGasPrice: get<number>('ethereum_max_gas_price'),
    contracts: new Map<string, any>(),
  }
  const network = new Map<string, BlockChainSetting>()
  return network.set('ethereumSetting', ethereumSetting)
}
