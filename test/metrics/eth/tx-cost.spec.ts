import { expect, it } from "vitest"

import query from "../../../src/metrics/eth/tx-cost"
import { Candle, PriceUnit } from "../../../src/primitives"

it("Daily candles in USD", async () => {
  // act
  const candles = (await query({
    timeframe: "Day",
    since: "1628121600",
    until: "1628553600",
  })) as Candle[]
  // assert
  expect(
    candles.map((x) => ({
      close: parseFloat(x.close) * 21_000,
      open: parseFloat(x.open) * 21_000,
      low: parseFloat(x.low) * 21_000,
      high: parseFloat(x.high) * 21_000,
      timestamp: x.timestamp,
    }))
  ).toMatchSnapshot()
})

it("Daily candles in ETH", async () => {
  // act
  const candles = (await query({
    timeframe: "Day",
    since: "1628121600",
    until: "1628553600",
    priceUnit: PriceUnit.ETH,
  })) as Candle[]
  // assert
  expect(
    candles.map((x) => ({
      close: parseFloat(x.close) * 21_000,
      open: parseFloat(x.open) * 21_000,
      low: parseFloat(x.low) * 21_000,
      high: parseFloat(x.high) * 21_000,
      timestamp: x.timestamp,
    }))
  ).toMatchSnapshot()
})

it("Weekly candles", async () => {
  // act
  const candles = (await query({
    timeframe: "Week",
    since: "1627862400",
    until: "1630886400",
  })) as Candle[]
  // assert
  expect(
    candles.map((x) => ({
      close: parseFloat(x.close) * 21_000,
      open: parseFloat(x.open) * 21_000,
      low: parseFloat(x.low) * 21_000,
      high: parseFloat(x.high) * 21_000,
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
