export interface RespExchangeRate {
  isSuccess: boolean
  detailCode?: string
  message?: string
  result?: {
    localTradedAt?: string
    closePrice?: string
    fluctuations?: string
    fluctuationsRatio?: string
    fluctuationsType?: {
      code?: string
      text?: string
      name?: string
    }
    cashBuyValue?: string
    cashSellValue?: string
    sendValue?: string
    receiveValue?: string
  }[]
}
