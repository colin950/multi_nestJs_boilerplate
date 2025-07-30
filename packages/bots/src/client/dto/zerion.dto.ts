export interface RespGetFungibleAssets {
  data: {
    id: string // asset id
    attributes: {
      name: string // ex) Moca
      symbol: string // ex) MOCA
      market_data: {
        price: number
        total_supply: number
        circulating_supply: number
        market_cap: number
        changes: {
          percent_1d: number
        }
      }
      implementations: {
        chain_id: string
        address: string
      }[]
    }
  }[]
}

export interface RespGetChartForFungibleAsset {
  data: {
    type: string
    id: string
    attributes: {
      begin_at: string
      end_at: string
      stats: {
        first: number
        min: number
        avg: number
        max: number
        last: number
      }
      points: [number, number][]
    }
  }
}
