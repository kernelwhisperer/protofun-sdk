import { expect, it } from "vitest"

import * as protofun from "../src/protofun"

it("should have named exports", () => {
  expect(Object.keys(protofun)).toMatchInlineSnapshot(`
    [
      "IndexerError",
      "PROTOCOL_MAP",
      "PROTOCOL_IDS",
      "PROTOCOLS",
      "METRICS_MAP",
      "METRICS",
      "getMetric",
      "getMetricPrecision",
      "getSignificantDigits",
      "TIME_FRAMES",
      "PriceUnit",
      "DEFAULT_POLLING_INTERVAL",
      "wait",
      "noop",
      "allTimeframes",
      "getLowestTimeframe",
      "isProtocolId",
      "isMetric",
      "isTimeframe",
      "isCandle",
      "isCandleArray",
      "formatNumber",
    ]
  `)
})
