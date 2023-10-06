import { expect, it } from "vitest"

import query, { subscribe } from "../../../src/metrics/eth/tx_cost"
import { Candle, PriceUnit } from "../../../src/primitives"
import { wait } from "../../../src/utils"

const mapToSimpleTransfer = (x: Candle) => ({
  close: (parseFloat(x.close) * 21_000) / 1e18,
  high: (parseFloat(x.high) * 21_000) / 1e18,
  low: (parseFloat(x.low) * 21_000) / 1e18,
  open: (parseFloat(x.open) * 21_000) / 1e18,
  timestamp: x.timestamp,
})

it("Daily candles in USD", async () => {
  // act
  const candles = await query({
    since: "1628121600",
    timeframe: "Day",
    until: "1628553600",
  })
  // assert
  expect(candles.map(mapToSimpleTransfer)).toMatchSnapshot()
})

it("Daily candles in ETH", async () => {
  // act
  const candles = await query({
    priceUnit: PriceUnit.ETH,
    since: "1628121600",
    timeframe: "Day",
    until: "1628553600",
  })
  // assert
  expect(candles.map(mapToSimpleTransfer)).toMatchSnapshot()
})

// TODO
it.skip("Weekly candles in USD", async () => {
  // act
  const candles = await query({
    since: "1627862400",
    timeframe: "Week",
    until: "1630886400",
  })
  // assert
  expect(candles.map(mapToSimpleTransfer)).toMatchSnapshot()
})

// TODO
it.skip("Weekly candles in ETH", async () => {
  // act
  const candles = await query({
    priceUnit: PriceUnit.ETH,
    since: "1627862400",
    timeframe: "Week",
    until: "1630886400",
  })
  // assert
  expect(candles.map(mapToSimpleTransfer)).toMatchSnapshot()
})

it("Match the correct size", async () => {
  // act
  const candles = await query({
    timeframe: "Day",
    until: "1630886400",
  })
  // assert
  expect(candles.length).to.equal(33)
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

it("Subscribe", async () => {
  // arrange
  const timeframe = "Minute"
  const candles = await query({
    limit: 1,
    timeframe,
  })
  // act
  const unsubscribe = subscribe({
    onNewData: (data) => {
      candles.push(data)
      unsubscribe()
    },
    pollingInterval: 3_000,
    since: candles[0].timestamp,
    timeframe,
  })
  // assert
  await wait(5_000)
  // Sometimes, if we're lucky, we get the next candle + an update to the previous one
  expect([2, 3]).to.include(candles.length)
})
