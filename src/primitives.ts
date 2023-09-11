export type Timeframe = "Block" | "Minute" | "Hour" | "Day" | "Week"

export enum PriceUnit {
  ETH = "ETH",
  USD = "USD",
  GWEI = "Gwei",
}

export type Block = {
  id: string // bytes
  number: string // BigInt
  timestamp: string // BigInt
  gasUsed: string // BigInt
  baseFeePerGas: string // BigInt
  // txns: Array<Txn>
  txnCount: number
  minGasPrice: string // BigInt
  maxGasPrice: string // BigInt
  firstGasPrice: string // BigInt
  lastGasPrice: string // BigInt
  gasFees: string // BigInt
  burnedFees: string // BigInt
  minerTips: string // BigInt
}

export type SimpleBlock = Omit<Block, "txns" | "timestamp"> & {
  timestamp: string
}

export type Candle = {
  close: string
  high: string
  low: string
  open: string
  timestamp: string
}

export function isCandle(value: unknown): value is Candle {
  return typeof value === "object" && value !== null && "open" in value
}

export function isCandleArray(value: unknown[]): value is Candle[] {
  return Array.isArray(value) && value.length > 0 && isCandle(value[0])
}

export type QueryRequest = {
  timeframe: Timeframe
  since?: string
  until?: string
  priceUnit?: PriceUnit
  /**
   * @default 1000
   */
  limit?: number
}
export type QueryResult = Promise<Candle[] | SimpleBlock[]>
export type QueryFn = (request: QueryRequest) => QueryResult
