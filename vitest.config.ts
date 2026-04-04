import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "coverage",
    },
    environment: "node",
    fileParallelism: false,
    globals: true,
    include: ["src/**/*.test.ts", "src/**/__tests__/**/*.test.ts"],
    maxWorkers: 1,
    minWorkers: 1,
    setupFiles: [],
  },
});
