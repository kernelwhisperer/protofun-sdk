import { expect, it } from "vitest"

import query from "../../../src/metrics/eth/base_fee"

it("Blocks", async () => {
  // act
  const candles = await query({
    timeframe: "Block",
    since: "0",
    until: "1628166868",
  })
  // assert
  expect(candles).toMatchSnapshot()
})

it("Daily candles", async () => {
  // act
  const candles = await query({
    timeframe: "Day",
    since: "1628121600",
    until: "1628553600",
  })
  // assert
  expect(candles).toMatchSnapshot()
})

it("Weekly candles", async () => {
  // act
  const candles = await query({
    timeframe: "Week",
    since: "1627862400",
    until: "1630886400",
  })
  // assert
  expect(candles).toMatchSnapshot()
})
