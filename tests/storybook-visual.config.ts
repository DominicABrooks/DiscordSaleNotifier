import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./visual",
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: "html",
  use: {
    trace: "on-first-retry"
  },
  webServer: {
    command: "npx --yes http-server ../frontend/storybook-static --port 6006 --silent",
    url: "http://127.0.0.1:6006",
    reuseExistingServer: true,
    timeout: 120000
  }
});
