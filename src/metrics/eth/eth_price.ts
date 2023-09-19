import {
  QueryRequest,
  QueryResult,
  SubscribeRequest,
  SubscribeResult,
  Timeframe,
} from "../../primitives"

const timeframeMapping: Partial<Record<Timeframe, string>> = {
  Day: "1d",
  Hour: "1h",
  Minute: "1m",
  Week: "1w",
}

export const supportedTimeframes: Timeframe[] = ["Minute", "Hour", "Day", "Week"]

export default async function query(request: QueryRequest): QueryResult {
  const { timeframe, since, until, limit = 1000 } = request
  const interval = timeframeMapping[timeframe]

  if (!supportedTimeframes.includes(timeframe)) {
    throw new Error(`Timeframe '${timeframe}' is not supported for this metric.`)
  }

  let apiUrl = `https://api.binance.com/api/v3/klines?symbol=ETHUSDT&interval=${interval}&limit=${limit}`
  if (since) {
    const timestamp = parseInt(since) * 1000
    apiUrl = `${apiUrl}&startTime=${timestamp}`
  }
  if (until) {
    const timestamp = parseInt(until) * 1000
    apiUrl = `${apiUrl}&endTime=${timestamp}`
  }

  const res = await fetch(apiUrl)
  const data = await res.json()

  // [
  //   [
  //     1499040000000,      // Kline open time
  //     "0.01634790",       // Open price
  //     "0.80000000",       // High price
  //     "0.01575800",       // Low price
  //     "0.01577100",       // Close price
  //     "148976.11427815",  // Volume
  //     1499644799999,      // Kline Close time
  //     "2434.19055334",    // Quote asset volume
  //     308,                // Number of trades
  //     "1756.87402397",    // Taker buy base asset volume
  //     "28.46694368",      // Taker buy quote asset volume
  //     "0"                 // Unused field, ignore.
  //   ]
  // ]
  return data.map((x: number[]) => ({
    close: x[4],
    high: x[2],
    low: x[3],
    open: x[1],
    timestamp: String(x[0] / 1000),
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