import { expect, it } from "vitest"

import query from "../../../src/metrics/eth/base_fee"

it("Blocks", async () => {
  // act
  const candles = await query({
    since: "0",
    timeframe: "Block",
    until: "1628166868",
  })
  // assert
  expect(candles).toMatchSnapshot()
})

it("Daily candles", async () => {
  // act
  const candles = await query({
    since: "1628121600",
    timeframe: "Day",
    until: "1628553600",
  })
  // assert
  expect(candles).toMatchSnapshot()
})

it("Weekly candles", async () => {
  // act
  const candles = await query({
    since: "1627862400",
    timeframe: "Week",
    until: "1630886400",
  })
  // assert
  expect(candles).toMatchSnapshot()
})
