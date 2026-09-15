import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./visual",
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: "html",
  snapshotPathTemplate: "{testDir}/{testFileName}-snapshots/{arg}{ext}",
  expect: {
    toHaveScreenshot: { maxDiffPixels: 20, animations: "disabled" },
  },
  use: {
    viewport: { width: 1280, height: 800 },
    trace: "on-first-retry"
  },
  webServer: {
    command: "npx --yes http-server ../frontend/storybook-static --port 6006 --silent",
    url: "http://127.0.0.1:6006",
    reuseExistingServer: true,
    timeout: 120000
  }
});
