import { expect, it } from "vitest"

import query, { subscribe } from "../../../src/metrics/comp/tvl"
import { wait } from "../../../src/protofun"

it("Daily candles", async () => {
  // act
  const candles = await query({
    timeframe: "Day",
    // since: "0",
    until: "1661811308",
  })
  // assert
  expect(candles).toMatchSnapshot()
})

it("Hourly candles", async () => {
  // act
  const candles = await query({
    timeframe: "Hour",
    // since: "0",
    until: "1661494432",
  })
  // assert
  expect(candles).toMatchSnapshot()
})

it("Weekly candles", async () => {
  // act
  try {
    await query({
      timeframe: "Week",
      // since: "0",
      until: "1661811308",
    })
  } catch (error) {
    // assert
    expect(error).toMatchInlineSnapshot(
      "[Error: Timeframe 'Week' is not supported for this metric.]"
    )
  }
})

it("Subscribe", async () => {
  // arrange
  const timeframe = "Hour"
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
    pollingInterval: 1000,
    since: candles[0].timestamp,
    timeframe,
  })
  // assert
  await wait(3_000)
  expect(candles.length).to.equal(2)
})
