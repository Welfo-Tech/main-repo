import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    env: {
      DATABASE_URL: "postgresql://test:test@localhost:5432/welfo_test",
      NODE_ENV: "test",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
    },
  },
});
