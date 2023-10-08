import { expect, it } from "vitest"

import query, { subscribe } from "../../../src/metrics/eth/eth_price"
import { wait } from "../../../src/utils"

it("Daily candles", async () => {
  // act
  const candles = await query({
    since: "1463529600",
    timeframe: "Day",
    until: "1464048000",
  })
  // assert
  expect(candles).toMatchSnapshot()
})

it("Daily candles - EIP 1559", async () => {
  // act
  const candles = await query({
    since: "1628121600",
    timeframe: "Day",
    until: "1628553600",
  })
  // assert
  expect(candles).toMatchSnapshot()
})

it("Hourly candles - EIP 1559", async () => {
  // act
  const candles = await query({
    since: "1628121600",
    timeframe: "Hour",
    until: "1628136000",
  })
  // assert
  expect(candles).toMatchSnapshot()
})

it("Hourly candles > 300", async () => {
  // act
  const candles = await query({
    since: "1695577147",
    timeframe: "Hour",
    until: "1696761547",
  })
  // assert
  expect(candles.length).to.equal(329)
})

it("Hourly candles === 1000", async () => {
  // act
  const candles = await query({
    since: String(1696761547 - 3600 * 1_000),
    timeframe: "Hour",
    until: "1696761547",
  })
  // assert
  expect(candles.length).to.equal(1000)
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
    // eslint-disable-next-line no-console
    onError: console.error,
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
