import { createBinanceQuery, createBinanceSubscribe } from "../../adapters/binance-adapter"
import { getMetric } from "../../protofun"

const query = createBinanceQuery("COMPUSDT", getMetric("comp", "comp_price").timeframes)

export default query

export const subscribe = createBinanceSubscribe(query)
