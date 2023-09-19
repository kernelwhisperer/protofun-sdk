import {
  Candle,
  PriceUnit,
  QueryRequest,
  QueryResult,
  SubscribeRequest,
  SubscribeResult,
} from "../../primitives"
import { getMetric } from "../../protofun"
import queryBaseFeePerGas from "./base_fee"
import queryEtherPrice from "./eth_price"

const supportedTimeframes = getMetric("eth", "tx_cost").timeframes

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
    return baseFeePerGas
  }

  etherPrice = etherPrice.slice(etherPrice.length - baseFeePerGas.length)

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

export function subscribe(request: SubscribeRequest): SubscribeResult {
  const { timeframe, since, onNewData, priceUnit, pollingInterval = 3000 } = request
  let lastTimestamp = since

  const intervalId = setInterval(async () => {
    const data = await query({ priceUnit, since: lastTimestamp, timeframe })

    if (data.length) {
      lastTimestamp = data[data.length - 1].timestamp
      data.forEach(onNewData)
    }
  }, pollingInterval)

  return function cleanup() {
    clearInterval(intervalId)
  }
}
