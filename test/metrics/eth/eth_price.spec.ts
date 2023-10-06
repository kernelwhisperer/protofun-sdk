import { expect, it } from "vitest"

import query, { subscribe } from "../../../src/metrics/eth/eth_price"
import { wait } from "../../../src/utils"

it("Daily candles", async () => {
  // act
  const candles = await query({
    timeframe: "Day",
    until: "1503273600",
    variant: 1,
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
    variant: 1,
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
    variant: 1,
  })
  // assert
  expect(candles).toMatchSnapshot()
})

it("Block candles", async () => {
  // act
  try {
    await query({
      timeframe: "Block",
      variant: 1,
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
    variant: 1,
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
    variant: 1,
  })
  // assert
  await wait(5_000)
  expect(candles.length).to.equal(2)
})
