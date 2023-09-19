import {
  Candle,
  MetricId,
  METRICS_MAP,
  PROTOCOL_MAP,
  ProtocolId,
  QueryFn,
  SubscribeFn,
  TIME_FRAMES,
  Timeframe,
} from "./protofun"

export async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const allTimeframes: Timeframe[] = ["Block", "Minute", "Hour", "Day", "Week"]

export type MetricFnsResult = {
  query: QueryFn
  subscribe: SubscribeFn
}

export async function loadMetricFns(
  protocolId: ProtocolId,
  metricId: MetricId,
  packagePath = "protofun/dist/metrics"
): Promise<MetricFnsResult> {
  const module = await import(`${packagePath}/${protocolId}/${metricId}`)
  const { default: query, subscribe } = module
  return { query, subscribe }
}

export function getLowestTimeframe(supportedTimeframes: Timeframe[]) {
  return supportedTimeframes.find((x) => x !== "Block") as Timeframe
}

export function isProtocolId(value: string): value is ProtocolId {
  return value in PROTOCOL_MAP
}

export function isMetric(protocol: ProtocolId, value: string): value is MetricId {
  return !!METRICS_MAP[protocol]?.[value as MetricId]
}

export function isTimeframe(value: string): value is Timeframe {
  return Object.keys(TIME_FRAMES).includes(value)
}

export function isCandle(value: unknown): value is Candle {
  return typeof value === "object" && value !== null && "open" in value
}

export function isCandleArray(value: unknown[]): value is Candle[] {
  return Array.isArray(value) && value.length > 0 && isCandle(value[0])
}
