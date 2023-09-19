import { MetricId, ProtocolId, QueryFn, SubscribeFn, Timeframe } from "./protofun"

export async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const allTimeframes: Timeframe[] = ["Block", "Minute", "Hour", "Day", "Week"]

export type MetricFnsResult = {
  query: QueryFn
  subscribe: SubscribeFn
  supportedTimeframes: Timeframe[]
}

export async function loadMetricFns(
  protocolId: ProtocolId,
  metricId: MetricId,
  packagePath = "protofun/dist/metrics"
): Promise<MetricFnsResult> {
  const module = await import(`${packagePath}/${protocolId}/${metricId}`)
  const { default: query, supportedTimeframes = allTimeframes, subscribe } = module
  return { query, subscribe, supportedTimeframes }
}

export function getLowestTimeframe(supportedTimeframes: Timeframe[]) {
  return supportedTimeframes.find((x) => x !== "Block") as Timeframe
}
