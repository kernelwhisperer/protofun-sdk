import {
  BinanceKline,
  Candle,
  DEFAULT_POLLING_INTERVAL,
  QueryFn,
  QueryRequest,
  QueryResult,
  SubscribeRequest,
  SubscribeResult,
  Timeframe,
} from "../primitives"

const timeframeMapping: Partial<Record<Timeframe, string>> = {
  Day: "1d",
  Hour: "1h",
  Minute: "1m",
  Week: "1w",
}

export function createBinanceQuery(symbol: string, supportedTimeframes: Timeframe[]) {
  return async function query(request: QueryRequest): QueryResult {
    const { timeframe, since, until, limit = 1000 } = request
    const interval = timeframeMapping[timeframe]

    if (!supportedTimeframes.includes(timeframe)) {
      throw new Error(`Timeframe '${timeframe}' is not supported for this metric.`)
    }

    let apiUrl = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
    if (since) {
      const timestamp = parseInt(since) * 1000
      apiUrl = `${apiUrl}&startTime=${timestamp}`
    }
    if (until) {
      const timestamp = parseInt(until) * 1000
      apiUrl = `${apiUrl}&endTime=${timestamp}`
    }

    const res = await fetch(apiUrl)
    const data = (await res.json()) as BinanceKline[]

    const candles: Candle[] = data.map((x) => ({
      close: x[4],
      high: x[2],
      low: x[3],
      open: x[1],
      timestamp: String(x[0] / 1000),
      volume: x[5],
    }))

    return candles
  }
}

export function createBinanceSubscribe(query: QueryFn) {
  return function subscribe(request: SubscribeRequest): SubscribeResult {
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

      if (data.length) {
        lastTimestamp = data[data.length - 1].timestamp
        data.forEach(onNewData)
      }
    }, pollingInterval)

    return function cleanup() {
      clearInterval(intervalId)
    }
  }
}
