import { Candle, PriceUnit, QueryRequest, QueryResult, Timeframe } from "../../primitives"
import queryBaseFeePerGas from "./base_fee"
import queryEtherPrice from "./eth_price"

export const supportedTimeframes: Timeframe[] = ["Minute", "Hour", "Day", "Week"]

export default async function query(request: QueryRequest): QueryResult {
  const { timeframe, since, until, priceUnit, limit = 1000 } = request

  if (!supportedTimeframes.includes(timeframe)) {
    throw new Error(`Timeframe '${timeframe}' is not supported for this metric.`)
  }

  let [baseFeePerGas, etherPrice] = await Promise.all([
    queryBaseFeePerGas({ limit, since, timeframe, until }),
    priceUnit === PriceUnit.ETH
      ? Promise.resolve([])
      : queryEtherPrice({ limit, since, timeframe, until }),
  ])

  if (priceUnit === PriceUnit.ETH) {
    return baseFeePerGas as Candle[]
  }

  etherPrice = etherPrice.slice(etherPrice.length - baseFeePerGas.length)
  baseFeePerGas = baseFeePerGas as Candle[]

  if (baseFeePerGas.length !== etherPrice.length) {
    // eslint-disable-next-line no-console
    console.log("📜 LOG > baseFeePerGas, etherPrice:", baseFeePerGas, etherPrice)
    throw new Error("queryTransferCostUsd: This should never happen!")
  }

  return baseFeePerGas.map((x, index) => ({
    ...x,
    close: String(parseFloat(x.close) * parseFloat((etherPrice[index] as Candle).close)),
    high: String(parseFloat(x.high) * parseFloat((etherPrice[index] as Candle).high)),
    low: String(parseFloat(x.low) * parseFloat((etherPrice[index] as Candle).low)),
    open: String(parseFloat(x.open) * parseFloat((etherPrice[index] as Candle).open)),
    timestamp: x.timestamp,
  }))
}
