import { expect, it } from "vitest"

import * as protofun from "../src/protofun"

it("should have named exports", () => {
  expect(Object.keys(protofun)).toMatchInlineSnapshot(`
    [
      "IndexerError",
      "METRIC_DECLARATIONS",
      "PriceUnit",
      "isCandle",
      "isCandleArray",
    ]
  `)
})
