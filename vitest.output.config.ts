import { defineConfig } from "vitest/config";

/** Runs against dist/ after `npm run build:all`. */
export default defineConfig({
  test: { include: ["tests/output/**/*.test.ts"], environment: "node", testTimeout: 120_000 },
});
