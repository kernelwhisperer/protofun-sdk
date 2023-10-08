import {
  Candle,
  DEFAULT_POLLING_INTERVAL,
  PriceUnit,
  QueryRequest,
  QueryResult,
  SubscribeRequest,
  SubscribeResult,
} from "../../primitives"
import { getMetric, LoggerFn, noop } from "../../protofun"
import queryBaseFeePerGas from "./base_fee"
import queryEtherPrice from "./eth_price"

const supportedTimeframes = getMetric("eth", "tx_cost").timeframes

export default async function query(request: QueryRequest): QueryResult {
  const { timeframe, since, until, priceUnit, limit = 300 } = request

  if (!supportedTimeframes.includes(timeframe)) {
    throw new Error(`Timeframe '${timeframe}' is not supported for this metric.`)
  }

  const [gasCandles, priceCandles] = await Promise.all([
    queryBaseFeePerGas({ limit, since, timeframe, until }),
    priceUnit === PriceUnit.ETH
      ? Promise.resolve([])
      : queryEtherPrice({ limit, since, timeframe, until, variant: 0 }),
  ])

  if (priceUnit === PriceUnit.ETH) {
    return gasCandles
  }

  const etherPriceMap: Record<string, Candle> = {}

  for (let i = 0; i < priceCandles.length; i++) {
    const priceCandle = priceCandles[i]
    etherPriceMap[priceCandle.timestamp] = priceCandle
  }

  const parsed: Candle[] = []

  for (let i = 0; i < gasCandles.length; i++) {
    const gasCandle = gasCandles[i]
    const priceCandle = etherPriceMap[gasCandle.timestamp]

    if (!priceCandle) continue

    parsed.push({
      close: String(parseFloat(gasCandle.close) * parseFloat(priceCandle.close)),
      high: String(parseFloat(gasCandle.high) * parseFloat(priceCandle.high)),
      low: String(parseFloat(gasCandle.low) * parseFloat(priceCandle.low)),
      open: String(parseFloat(gasCandle.open) * parseFloat(priceCandle.open)),
      timestamp: gasCandle.timestamp,
    })
  }

  return parsed
}

export function subscribe(request: SubscribeRequest, logger: LoggerFn = noop): SubscribeResult {
  const {
    timeframe,
    since,
    onNewData,
    priceUnit,
    pollingInterval = DEFAULT_POLLING_INTERVAL,
  } = request
  let lastTimestamp = since

  const intervalId = setInterval(async () => {
    const data = await query({ priceUnit, since: lastTimestamp, timeframe })
    logger("subscribe: query finished", {
      dataLength: data.length,
      lastTimestamp,
      nextTimestamp: data[data.length - 1].timestamp,
      priceUnit,
      timeframe,
    })

    if (data.length) {
      lastTimestamp = data[data.length - 1].timestamp
      data.forEach(onNewData)
    }
  }, pollingInterval)

  return function cleanup() {
    clearInterval(intervalId)
  }
}
