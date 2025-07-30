export interface BlockChainSetting {
  networkName: string
  endpoint: string
  chainId: number
  maxGasPrice: number
  contracts: Map<string, ContractSetting>
}

export interface ContractSetting {
  operators?: string[]
  contractAddress: string
  ABI: string
}
