import { expect, it } from "vitest"

import query from "../../../src/metrics/eth/eth_price"

it("Daily candles", async () => {
  // act
  const candles = await query({
    timeframe: "Day",
    since: "0",
    until: "1503273600",
  })
  // assert
  expect(candles).toMatchSnapshot()
})

it("Daily candles - EIP 1559", async () => {
  // act
  const candles = await query({
    timeframe: "Day",
    since: "1628121600",
    until: "1628553600",
  })
  // assert
  expect(candles).toMatchSnapshot()
})

it("Hourly candles", async () => {
  // act
  const candles = await query({
    timeframe: "Hour",
    since: "0",
    until: "1502960400",
  })
  // assert
  expect(candles).toMatchSnapshot()
})

it("Block candles", async () => {
  // act
  try {
    await query({
      timeframe: "Block",
    })
  } catch (error) {
    // assert
    expect(error).toMatchInlineSnapshot(
      "[Error: Timeframe 'Block' is not supported for this metric.]"
    )
  }
})
