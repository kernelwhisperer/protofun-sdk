export type Timeframe = "Block" | "Minute" | "Hour" | "Day" | "Week"

export enum PriceUnit {
  ETH = "ETH",
  USD = "USD",
  GWEI = "Gwei",
}

export type Block = {
  baseFeePerGas: string // BigInt
  burnedFees: string // BigInt
  firstGasPrice: string // BigInt
  gasFees: string // BigInt
  gasUsed: string // BigInt
  id: string // bytes
  lastGasPrice: string // BigInt
  maxGasPrice: string // BigInt
  minGasPrice: string // BigInt
  minerTips: string // BigInt
  number: string // BigInt
  timestamp: string // BigInt
  // txns: Array<Txn>
  txnCount: number
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
  /**
   * @default 1000
   */
  limit?: number
  priceUnit?: PriceUnit
  since?: string
  timeframe: Timeframe
  until?: string
}
export type QueryResult = Promise<Candle[] | SimpleBlock[]>
export type QueryFn = (request: QueryRequest) => QueryResult
