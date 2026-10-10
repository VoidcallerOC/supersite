import { defineConfig, devices } from "@playwright/test";

/** Serves the built sites (run `npm run build:all` first) on localhost only. */
const SITES = [
  { id: "harborline", port: 4101 },
  { id: "lantern", port: 4102 },
  { id: "tallyhook", port: 4103 },
];

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  reporter: [["list"]],
  use: { trace: "off" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 860 } } },
    { name: "mobile", use: { ...devices["Desktop Chrome"], viewport: { width: 375, height: 740 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 } },
  ],
  webServer: SITES.map((s) => ({
    command: `node scripts/serve.mjs --site ${s.id} --port ${s.port}`,
    url: `http://127.0.0.1:${s.port}/`,
    reuseExistingServer: false,
    stdout: "ignore",
  })),
});
