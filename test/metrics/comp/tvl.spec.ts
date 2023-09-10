import { expect, it } from "vitest"

import query from "../../../src/metrics/comp/tvl"

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
