import { createClient, fetchExchange, gql } from "urql/core"

import { IndexerError } from "../../errors"
import {
  BlockData,
  Candle,
  DEFAULT_POLLING_INTERVAL,
  QueryRequest,
  QueryResult,
  SubscribeRequest,
  SubscribeResult,
} from "../../primitives"

// TODO enable text compression on the api
const API_URL = "https://api.protocol.fun/subgraphs/name/protofun_block_meta"

const client = createClient({
  exchanges: [fetchExchange],
  url: API_URL,
})

export default async function query(request: QueryRequest): QueryResult {
  const { timeframe, since, until, limit = 1000 } = request

  const collection = timeframe === "Block" ? "blocks" : `baseFeePerGas${timeframe}Candles`

  const graphQuery = gql`query($since: BigInt, $until: BigInt) {
    ${collection}(
      first: ${String(limit)}
      orderBy: timestamp
      orderDirection: desc,
      where: {
        ${since ? `timestamp_gte: $since,` : ""}
        ${until ? `timestamp_lte: $until,` : ""}
      }
    ) {
      ${
        collection === "blocks"
          ? `timestamp
             baseFeePerGas`
          : `timestamp
             open
             high
             low
             close`
      }
   
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

  if (collection === "blocks") {
    const data = response.data[collection] as BlockData[]

    const parsed: Candle[] = []

    for (let i = data.length - 1; i >= 0; i--) {
      const entry = data[i]

      parsed.push({
        close: entry.baseFeePerGas,
        high: entry.baseFeePerGas,
        low: entry.baseFeePerGas,
        open: entry.baseFeePerGas,
        timestamp: entry.timestamp,
      })
    }
    return parsed
  } else {
    const data = response.data[collection] as Candle[]
    const reversed: Candle[] = []
    for (let i = data.length - 1; i >= 0; i--) {
      reversed.push(data[i])
    }
    return reversed
  }
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
