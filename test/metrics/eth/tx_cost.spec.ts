import { expect, it } from "vitest"

import query from "../../../src/metrics/eth/tx_cost"
import { Candle, PriceUnit } from "../../../src/primitives"

it("Daily candles in USD", async () => {
  // act
  const candles = (await query({
    since: "1628121600",
    timeframe: "Day",
    until: "1628553600",
  })) as Candle[]
  // assert
  expect(
    candles.map((x) => ({
      close: parseFloat(x.close) * 21_000,
      high: parseFloat(x.high) * 21_000,
      low: parseFloat(x.low) * 21_000,
      open: parseFloat(x.open) * 21_000,
      timestamp: x.timestamp,
    }))
  ).toMatchSnapshot()
})

it("Daily candles in ETH", async () => {
  // act
  const candles = (await query({
    priceUnit: PriceUnit.ETH,
    since: "1628121600",
    timeframe: "Day",
    until: "1628553600",
  })) as Candle[]
  // assert
  expect(
    candles.map((x) => ({
      close: parseFloat(x.close) * 21_000,
      high: parseFloat(x.high) * 21_000,
      low: parseFloat(x.low) * 21_000,
      open: parseFloat(x.open) * 21_000,
      timestamp: x.timestamp,
    }))
  ).toMatchSnapshot()
})

it("Weekly candles", async () => {
  // act
  const candles = (await query({
    since: "1627862400",
    timeframe: "Week",
    until: "1630886400",
  })) as Candle[]
  // assert
  expect(
    candles.map((x) => ({
      close: parseFloat(x.close) * 21_000,
      high: parseFloat(x.high) * 21_000,
      low: parseFloat(x.low) * 21_000,
      open: parseFloat(x.open) * 21_000,
      timestamp: x.timestamp,
    }))
  ).toMatchSnapshot()
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
