import { createBinanceQuery, createBinanceSubscribe } from "../../adapters/binance-adapter"
import { getMetric } from "../../protofun"

const query = createBinanceQuery("ETHUSDT", getMetric("eth", "eth_price").timeframes)

export default query

export const subscribe = createBinanceSubscribe(query)
