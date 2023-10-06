import { expect, it } from "vitest"

import query, { subscribe } from "../../../src/metrics/eth/base_fee"
import { wait } from "../../../src/utils"

it("Blocks", async () => {
  // act
  const candles = await query({
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
    pollingInterval: 100,
    since: candles[0].timestamp,
    timeframe,
  })
  // assert
  await wait(1_000)
  expect(candles.length).to.equal(2)
})
