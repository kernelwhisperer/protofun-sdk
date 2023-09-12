import { createClient, fetchExchange, gql } from "urql/core"

import { IndexerError } from "../../errors"
import { QueryRequest, QueryResult, Timeframe } from "../../primitives"
import { MarketDailySnapshot } from "./types"

// const API_KEY = "6e951d2948be69a241891fb15ec9cefb";
const API_KEY = "2760f1cc7d18310012284ffc4be34ebc"
const API_URL = `https://gateway.thegraph.com/api/${API_KEY}/subgraphs/id/6PaB6tKFqrL6YoAELEhFGU6Gc39cEynLbo6ETZMF3sCy`

const client = createClient({
  exchanges: [fetchExchange],
  url: API_URL,
})

const timeframeMapping: Partial<Record<Timeframe, string>> = {
  Day: "Daily",
  Hour: "Hourly",
}

export const supportedTimeframes: Timeframe[] = ["Hour", "Day"]

export default async function query(request: QueryRequest): QueryResult {
  const { timeframe, since, until, limit = 1000 } = request

  if (!supportedTimeframes.includes(timeframe)) {
    throw new Error(`Timeframe '${timeframe}' is not supported for this metric.`)
  }

  if (since) {
    throw new Error(`Live data  is not supported for this metric.`)
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

  if (response.data[collection].length === 0) {
    throw new IndexerError("Empty response. Has the subgraph finish syncing?")
  }

  const data = response.data[collection] as MarketDailySnapshot[]
  const parsed = []

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
