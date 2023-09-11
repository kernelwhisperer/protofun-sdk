import * as protofun from "../src/protofun"
import { it, expect } from "vitest"

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
