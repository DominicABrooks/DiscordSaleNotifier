import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
if (!process.env.NODE_ENV) {
  require('dotenv').config({ path: `${__dirname}//src//config//.env.development` });
} else {
  require('dotenv').config({
    path: `${__dirname}//src//config//.env.${process.env.NODE_ENV}`,
  });
}

/**
 * Parallelism strategy (do not naively flip these back to serial).
 * CREATE hits live Discord (GET + POST per call) and the suite owns exactly
 * 2 real webhook URLs as shared DB rows. So:
 * - *-lifecycle.spec.ts (stateful: add/duplicate/delete) runs on chromium
 *   ONLY, in serial mode, each test self-seeding its precondition via
 *   ensureWebhookExists/ensureWebhookNotExists. Chromium runs in parallel
 *   with the other browsers because no other project touches those rows.
 * - Everything else is stateless (static UI, validation negatives that never
 *   insert, read-only React API checks) and runs on all browsers x N workers.
 * Narrower scope (fewer browsers/serial) = slower but safer; do not broaden
 * without adding per-project webhook URLs.
 */
const lifecycleSpecs = ['**/api-lifecycle.spec.ts', '**/e2e-lifecycle.spec.ts'];

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './src/tests',
  /* Stateless specs run in parallel; serial describes inside lifecycle files stay serial */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Single worker on CI (sqlite-style caution with live Discord webhooks); parallel locally. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'setup db',
      testMatch: '*clean-db.setup.ts',
    },

    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup db'],
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    //   dependencies: ['setup db'],
    //   testIgnore: lifecycleSpecs,
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    //   dependencies: ['setup db'],
    //   testIgnore: lifecycleSpecs,
    // },
  ],
});
