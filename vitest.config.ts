import { defineConfig } from "vitest/config"

// https://vitest.dev/config/
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    testTimeout: 10_000,
    reporters: ["verbose"],
    coverage: {
      reporter: ["text", "html"],
    },
    maxConcurrency: 5,
  },
})
