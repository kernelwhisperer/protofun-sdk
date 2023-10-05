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

/**
 *
 *
 * [
 *   [
 *     1499040000000,      // Kline open time
 *     "0.01634790",       // Open price
 *     "0.80000000",       // High price
 *     "0.01575800",       // Low price
 *     "0.01577100",       // Close price
 *     "148976.11427815",  // Volume
 *     1499644799999,      // Kline Close time
 *     "2434.19055334",    // Quote asset volume
 *     308,                // Number of trades
 *     "1756.87402397",    // Taker buy base asset volume
 *     "28.46694368",      // Taker buy quote asset volume
 *     "0"                 // Unused field, ignore.
 *   ]
 * ]
 *
 */
export type BinanceKline = [
  number, // time
  string, // open
  string, // high
  string, // low
  string, // close
  string // volume
]

export type Candle = {
  close: string
  high: string
  low: string
  open: string
  timestamp: string
  volume?: string
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

export type LoggerFn = (message: string, metadata?: object) => void

/**
 * @returns cleanup function used to unsubscribe
 */
export type SubscribeResult = () => void
export type SubscribeFn = (request: SubscribeRequest, logger?: LoggerFn) => SubscribeResult
