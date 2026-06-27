import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    env: {
      DATABASE_URL: "postgresql://test:test@localhost:5432/welfo_test",
      NODE_ENV: "test",
      JWT_SECRET: "test-secret-that-is-at-least-32-characters-long!!",
      JWT_ACCESS_EXPIRY: "15m",
      JWT_REFRESH_EXPIRY: "7d",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
    },
  },
});
