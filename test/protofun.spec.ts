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
      "TIME_FRAMES",
      "PriceUnit",
      "wait",
      "allTimeframes",
      "getLowestTimeframe",
      "isProtocolId",
      "isMetric",
      "isTimeframe",
      "isCandle",
      "isCandleArray",
    ]
  `)
})
