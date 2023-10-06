import {
  Candle,
  CoinbaseBucket,
  DEFAULT_POLLING_INTERVAL,
  QueryFn,
  QueryRequest,
  QueryResult,
  SubscribeRequest,
  SubscribeResult,
  Timeframe,
} from "../primitives"
import { noop } from "../protofun"

const timeframeMapping: Partial<Record<Timeframe, string>> = {
  Day: "86400",
  Hour: "3600",
  Minute: "60",
  Week: "604800", // unsupported
}

export function createCoinbaseQuery(symbol: string, supportedTimeframes: Timeframe[]) {
  return async function query(request: QueryRequest): QueryResult {
    const { timeframe, since, until, limit = 300 } = request
    if (limit > 300) {
      throw new Error(`Coinbase query limit is 300, received: ${limit}`)
    }

    const interval = timeframeMapping[timeframe] as string

    if (!supportedTimeframes.includes(timeframe)) {
      throw new Error(`Timeframe '${timeframe}' is not supported for this metric.`)
    }

    let apiUrl = `https://api.exchange.coinbase.com/products/${symbol}/candles?granularity=${interval}`

    if (since) {
      apiUrl = `${apiUrl}&start=${since}`
    } else if (until) {
      apiUrl = `${apiUrl}&start=${parseInt(until) - parseInt(interval) * 300}`
    }
    if (until) {
      apiUrl = `${apiUrl}&end=${until}`
    } else if (since) {
      apiUrl = `${apiUrl}&end=${parseInt(since) + parseInt(interval) * 300}`
    }

    // console.log("📜 LOG > query > apiUrl:", apiUrl)
    const res = await fetch(apiUrl)
    const data = await res.json()

    if ("message" in data) {
      throw new Error(`Something unexpected went wrong: ${data.message}`)
    }
    const collection = data as CoinbaseBucket[]
    const candles: Candle[] = []

    for (let i = collection.length - 1; i >= 0; i--) {
      candles.push({
        close: String(data[i][4]),
        high: String(data[i][2]),
        low: String(data[i][1]),
        open: String(data[i][3]),
        timestamp: String(data[i][0]),
        volume: String(data[i][5]),
      })
    }

    if (collection.length > limit) {
      const end = collection.length
      return candles.slice(end - limit, end)
    }

    return candles
  }
}

export function createCoinbaseSubscribe(query: QueryFn) {
  return function subscribe(request: SubscribeRequest): SubscribeResult {
    const {
      timeframe,
      since,
      onNewData,
      onError = noop, // TODO for all
      priceUnit,
      pollingInterval = DEFAULT_POLLING_INTERVAL,
      variant,
    } = request
    let lastTimestamp = since

    const intervalId = setInterval(async () => {
      try {
        const data = await query({
          priceUnit,
          since: lastTimestamp,
          timeframe,
          variant,
        })

        if (data.length) {
          lastTimestamp = data[data.length - 1].timestamp
          data.forEach(onNewData)
        }
      } catch (error) {
        onError(error)
      }
    }, pollingInterval)

    return function cleanup() {
      clearInterval(intervalId)
    }
  }
}
