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

const timeframeMapping: Partial<Record<Timeframe, number>> = {
  Day: 86400,
  Hour: 3600,
  Minute: 60,
  Week: 604800, // unsupported
}

export function createCoinbaseQuery(symbol: string, supportedTimeframes: Timeframe[]) {
  return async function query(request: QueryRequest): QueryResult {
    const { timeframe, since, until, limit = 300 } = request

    const interval = timeframeMapping[timeframe] as number

    if (!supportedTimeframes.includes(timeframe)) {
      throw new Error(`Timeframe '${timeframe}' is not supported for this metric.`)
    }

    let apiUrl = `https://api.exchange.coinbase.com/products/${symbol}/candles?granularity=${interval}`

    let validSince = since
    let previousCandlesPromise: Promise<Candle[]> = Promise.resolve([])

    if (since && until) {
      const sinceParsed = parseInt(since)
      const untilParsed = parseInt(until)
      const records = (untilParsed - sinceParsed) / interval
      if (records <= 300) {
        validSince = since
      } else {
        validSince = String(untilParsed - interval * 300)
        previousCandlesPromise = query({
          limit,
          since,
          timeframe,
          until: validSince,
        })
      }
    }

    if (validSince) {
      apiUrl = `${apiUrl}&start=${validSince}`
    } else if (until) {
      apiUrl = `${apiUrl}&start=${parseInt(until) - interval * 300}`
    }
    if (until) {
      apiUrl = `${apiUrl}&end=${until}`
    } else if (validSince) {
      apiUrl = `${apiUrl}&end=${parseInt(validSince) + interval * 300}`
    }

    // console.log("📜 LOG > query > apiUrl:", apiUrl)
    const [res, previousCandles] = await Promise.all([fetch(apiUrl), previousCandlesPromise])
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

    return previousCandles.concat(candles)
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
