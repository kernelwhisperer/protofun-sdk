import { createBinanceQuery, createBinanceSubscribe } from "../../adapters/binance-adapter"
import { createCoinbaseQuery, createCoinbaseSubscribe } from "../../adapters/coinbase-adapter"
import {
  getMetric,
  QueryRequest,
  QueryResult,
  SubscribeRequest,
  SubscribeResult,
} from "../../protofun"

const coinbase = createCoinbaseQuery("BTC-USD", getMetric("btc", "btc_price").timeframes)
const binance = createBinanceQuery("BTCUSDT", getMetric("btc", "btc_price").timeframes)

export default async function query(request: QueryRequest): QueryResult {
  if (request.variant === 1) {
    return binance(request)
  }

  return coinbase(request)
}

export const binanceSub = createBinanceSubscribe(query)
export const coinbaseSub = createCoinbaseSubscribe(query)

export function subscribe(request: SubscribeRequest): SubscribeResult {
  if (request.variant === 1) {
    return binanceSub(request)
  }

  return coinbaseSub(request)
}
