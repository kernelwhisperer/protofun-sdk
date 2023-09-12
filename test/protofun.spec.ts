import { expect, it } from "vitest"

import * as protofun from "../src/protofun"

it("should have named exports", () => {
  expect(Object.keys(protofun)).toMatchInlineSnapshot(`
    [
      "IndexerError",
      "PriceUnit",
      "isCandle",
      "isCandleArray",
      "METRIC_DECLARATIONS",
    ]
  `)
})
