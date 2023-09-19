import { PriceUnit } from "./primitives"

const METRIC_DECLARATIONS = {
  aave: [],
  comp: ["tvl"],
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
}

export const PROTOCOL_MAP: Record<ProtocolId, Protocol> = {
  aave: {
    id: "aave",
    title: "Aave",
  },
  // btc: {
  //   enabled: false,
  //   id: "btc",
  //   title: "Bitcoin",
  // },
  comp: {
    enabled: true,
    id: "comp",
    title: "Compound",
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
  title: string
  variants?: Variant[]
}

// type MapType<T extends ProtocolId> = Record<
//   T,
//   Record<MetricIdsOfProtocol<T>, Metric>
// >;
type MetricsMapType = Record<ProtocolId, Partial<Record<MetricId, Metric>>>

export const METRICS_MAP: MetricsMapType = {
  aave: {} as Record<MetricIdForProtocol<"aave">, Metric>,
  comp: {
    tvl: {
      allowCompactPriceScale: true,
      disallowAlerts: true,
      disallowCandleType: true,
      disallowLiveMode: true,
      id: "tvl",
      precision: 1,
      priceUnits: [PriceUnit.USD],
      protocol: "comp",
      significantDigits: [0],
      title: "Total value locked",
      variants: [{ label: "Compound V3 USDC - Wrapped Ether", precision: 1 }],
    },
  } as Record<MetricIdForProtocol<"comp">, Metric>,
  eth: {
    base_fee: {
      id: "base_fee",
      precision: 1e9,
      preferredLogScale: true,
      priceUnits: [PriceUnit.GWEI],
      protocol: "eth",
      significantDigits: [2],
      title: "Base fee per gas",
    },
    eth_price: {
      disallowAlerts: true,
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
      disallowAlerts: true,
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
  } as Record<MetricIdForProtocol<"eth">, Metric>,
  mkr: {} as Record<MetricIdForProtocol<"mkr">, Metric>,
}

export const METRICS = PROTOCOL_IDS.map((protocolId) =>
  Object.values(METRICS_MAP[protocolId] || {})
).flat()