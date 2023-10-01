import { createBinanceQuery, createBinanceSubscribe } from "../../adapters/binance-adapter"
import { getMetric } from "../../protofun"

const query = createBinanceQuery("BTCUSDT", getMetric("btc", "btc_price").timeframes)

export default query

export const subscribe = createBinanceSubscribe(query)
