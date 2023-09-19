export type Timeframe = "Block" | "Minute" | "Hour" | "Day" | "Week"

export enum PriceUnit {
  ETH = "ETH",
  USD = "USD",
  GWEI = "Gwei",
}

/**
 * @internal
 */
export type BlockData = {
  baseFeePerGas: string // BigInt
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
export type QueryResult = Promise<Candle[]>
export type QueryFn = (request: QueryRequest) => QueryResult

export type SubscribeRequest = {
  onNewData: (data: Candle) => void
  /**
   * in milliseconds
   * @default 3000
   */
  pollingInterval?: number
  priceUnit?: PriceUnit
  since?: string
  timeframe: Timeframe
}

/**
 * @returns cleanup function used to unsubscribe
 */
export type SubscribeResult = () => void
export type SubscribeFn = (request: SubscribeRequest) => SubscribeResult
