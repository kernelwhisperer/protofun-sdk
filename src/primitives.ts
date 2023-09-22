export type Timeframe = "Block" | "Minute" | "Hour" | "Day" | "Week"
export const TIME_FRAMES: Record<Timeframe, string> = {
  Block: "Block",
  Minute: "1m",
  // eslint-disable-next-line sort-keys-fix/sort-keys-fix
  Hour: "1h",
  // eslint-disable-next-line sort-keys-fix/sort-keys-fix
  Day: "D",
  Week: "W",
}

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

export const DEFAULT_POLLING_INTERVAL = 2_000

export type SubscribeRequest = {
  onNewData: (data: Candle) => void
  /**
   * in milliseconds
   * @default 2000
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
