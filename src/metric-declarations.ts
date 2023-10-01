import { PriceUnit, Timeframe } from "./primitives"
import { allTimeframes } from "./utils"

const METRIC_DECLARATIONS = {
  aave: [],
  btc: ["btc_price"],
  comp: ["tvl", "comp_price"],
  eth: ["base_fee", "eth_price", "tx_cost"],
  mkr: [],
} as const

/**
 * Protocols
 */
export type ProtocolId = keyof typeof METRIC_DECLARATIONS
export type Protocol = {
  enabled?: boolean
  id: ProtocolId
  title: string
  wip?: boolean
}

export const PROTOCOL_MAP: Record<ProtocolId, Protocol> = {
  aave: {
    id: "aave",
    title: "Aave",
  },
  btc: {
    enabled: true,
    id: "btc",
    title: "Bitcoin",
  },
  comp: {
    enabled: true,
    id: "comp",
    title: "Compound",
    wip: true,
  },
  eth: {
    enabled: true,
    id: "eth",
    title: "Ethereum",
  },
  mkr: {
    id: "mkr",
    title: "MakerDAO",
  },
} as const

export const PROTOCOL_IDS = Object.keys(PROTOCOL_MAP) as ProtocolId[]

export const PROTOCOLS = Object.values(PROTOCOL_MAP).sort((a, b) => {
  if (a.enabled === b.enabled) {
    return 0
  } else if (a.enabled && !b.enabled) {
    return -1
  } else {
    return 1
  }
})

/**
 * Metrics
 */

// Not working:
// type ValueOf<T> = T[keyof T];
// export type MetricId = ValueOf<typeof METRIC_LIST_DEFINITION>[number];
export type MetricIdForProtocol<T extends ProtocolId> = typeof METRIC_DECLARATIONS[T][number]
export type MetricId = MetricIdForProtocol<ProtocolId>

export type Variant = {
  label: string
  precision: number
  value?: string
}

export type Metric = {
  allowCompactPriceScale?: boolean
  disallowAlerts?: boolean
  disallowCandleType?: boolean
  disallowLiveMode?: boolean
  id: MetricId
  precision: number
  preferredLogScale?: boolean
  priceUnits: PriceUnit[]
  protocol: ProtocolId
  significantDigits: number[]
  timeframes: Timeframe[]
  title: string
  variants?: Variant[]
  wip?: boolean
}

// type MapType<T extends ProtocolId> = Record<
//   T,
//   Record<MetricIdsOfProtocol<T>, Metric>
// >;
type MetricsMapType = Record<ProtocolId, Partial<Record<MetricId, Metric>>>

export const METRICS_MAP: MetricsMapType = {
  aave: {},
  btc: {
    btc_price: {
      id: "btc_price",
      precision: 1,
      preferredLogScale: true,
      priceUnits: [PriceUnit.USD],
      protocol: "btc",
      significantDigits: [0],
      timeframes: ["Minute", "Hour", "Day", "Week"],
      title: "BTC price",
    },
  },
  comp: {
    comp_price: {
      id: "comp_price",
      precision: 1,
      preferredLogScale: true,
      priceUnits: [PriceUnit.USD],
      protocol: "comp",
      significantDigits: [2],
      timeframes: ["Minute", "Hour", "Day", "Week"],
      title: "Comp price",
    },
    tvl: {
      allowCompactPriceScale: true,
      disallowCandleType: true,
      id: "tvl",
      precision: 1,
      priceUnits: [PriceUnit.USD],
      protocol: "comp",
      significantDigits: [0],
      timeframes: ["Hour", "Day"],
      title: "Total value locked",
      variants: [{ label: "V3 USDC - Wrapped Ether Pool", precision: 1 }],
      wip: true,
    },
  },
  eth: {
    base_fee: {
      id: "base_fee",
      precision: 1e9,
      preferredLogScale: true,
      priceUnits: [PriceUnit.GWEI],
      protocol: "eth",
      significantDigits: [2],
      timeframes: allTimeframes,
      title: "Base fee per gas",
    },
    eth_price: {
      id: "eth_price",
      precision: 1,
      preferredLogScale: true,
      priceUnits: [PriceUnit.USD],
      protocol: "eth",
      significantDigits: [2],
      timeframes: ["Minute", "Hour", "Day", "Week"],
      title: "Ether price",
    },
    tx_cost: {
      id: "tx_cost",
      precision: 1,
      preferredLogScale: true,
      priceUnits: [PriceUnit.USD, PriceUnit.ETH],
      protocol: "eth",
      significantDigits: [2, 5],
      timeframes: ["Minute", "Hour", "Day", "Week"],
      title: "Transaction cost",
      variants: [
        { label: "ETH Transfer", precision: 1e18 / 21_000 },
        { label: "ERC20 Approval", precision: 1e18 / 45_000 },
        { label: "ERC20 Transfer", precision: 1e18 / 65_000 },
        { label: "NFT Transfer", precision: 1e18 / 85_000 },
        { label: "Uniswap V2 Swap", precision: 1e18 / 150_000 },
        { label: "Uniswap V3 Swap", precision: 1e18 / 185_000 },
        { label: "L2 Deposit", precision: 1e18 / 250_000 },
      ],
    },
  },
  mkr: {},
}

export const METRICS = PROTOCOL_IDS.map((protocolId) =>
  Object.values(METRICS_MAP[protocolId] || {})
).flat()

export function getMetric(protocolId: ProtocolId, metricId: MetricId): Metric {
  const metric = METRICS_MAP[protocolId][metricId]

  if (!metric) {
    throw new Error("Metric not found.")
  }

  return metric
}

export function getMetricPrecision(metric: Metric, variantIndex: number): number {
  const { variants, precision: defaultPrecision } = metric
  return variants ? variants[variantIndex].precision : defaultPrecision
}

export function getSignificantDigits(metric: Metric, priceUnitIndex: number): number {
  return metric.significantDigits[priceUnitIndex]
}
