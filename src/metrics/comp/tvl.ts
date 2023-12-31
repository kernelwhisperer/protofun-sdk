import { createClient, fetchExchange, gql } from "urql/core"

import { IndexerError } from "../../errors"
import {
  Candle,
  DEFAULT_POLLING_INTERVAL,
  QueryRequest,
  QueryResult,
  SubscribeRequest,
  SubscribeResult,
  Timeframe,
} from "../../primitives"
import { getMetric } from "../../protofun"
import { MarketDailySnapshot } from "./types"

// const API_KEY = "6e951d2948be69a241891fb15ec9cefb";
// const API_KEY = "2760f1cc7d18310012284ffc4be34ebc"
// const API_URL = `https://gateway.thegraph.com/api/${API_KEY}/subgraphs/id/6PaB6tKFqrL6YoAELEhFGU6Gc39cEynLbo6ETZMF3sCy`
const API_URL = `https://api.studio.thegraph.com/query/46580/compv3/version/latest`

const client = createClient({
  exchanges: [fetchExchange],
  url: API_URL,
})

const timeframeMapping: Partial<Record<Timeframe, string>> = {
  Day: "Daily",
  Hour: "Hourly",
}

const supportedTimeframes = getMetric("comp", "tvl").timeframes

export default async function query(request: QueryRequest): QueryResult {
  const { timeframe, since, until, limit = 300 } = request

  if (!supportedTimeframes.includes(timeframe)) {
    throw new Error(`Timeframe '${timeframe}' is not supported for this metric.`)
  }

  const collection = `market${timeframeMapping[timeframe]}Snapshots`

  const graphQuery = gql`query($since: BigInt, $until: BigInt) {
    ${collection}(
      first: ${String(limit)}
      orderBy: timestamp
      orderDirection: desc
      where: {
        market_: {
          id: "0xc3d688b66703497daa19211eedff47f25384cdc3c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
        }
        ${since ? `timestamp_gte: $since,` : ""}
        ${until ? `timestamp_lte: $until,` : ""}
      }
    ) {
      totalValueLockedUSD
      market {
        id
        name
      }
      timestamp
    }
  }
`
  const response = await client.query(graphQuery, { since, until }).toPromise()

  if (response.error) {
    let errorMessage = response.error.toString()
    if (errorMessage.includes("ECONNREFUSED") || errorMessage.includes("Failed to fetch")) {
      errorMessage = "Connection failed"
    }

    throw new IndexerError(errorMessage)
  }

  const data = response.data[collection] as MarketDailySnapshot[]
  const parsed: Candle[] = []

  for (let i = data.length - 1; i >= 0; i--) {
    parsed.push({
      close: data[i].totalValueLockedUSD,
      high: data[i].totalValueLockedUSD,
      low: data[i].totalValueLockedUSD,
      open: data[i].totalValueLockedUSD,
      timestamp: data[i].timestamp,
    })
  }

  return parsed
}

export function subscribe(request: SubscribeRequest): SubscribeResult {
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
