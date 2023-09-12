import { createClient, fetchExchange, gql } from "urql/core"

import { IndexerError } from "../../errors"
import { QueryRequest, QueryResult } from "../../primitives"

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
          ? `number
             timestamp
             gasUsed
             baseFeePerGas
             burnedFees
             minerTips`
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

  return response.data[collection].reverse()
}
