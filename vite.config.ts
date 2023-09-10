import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: "./src/protofun.ts",
      name: "protofun",
      fileName: (format) => (format === "es" ? "protofun.mjs" : "protofun.js"),
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
})
