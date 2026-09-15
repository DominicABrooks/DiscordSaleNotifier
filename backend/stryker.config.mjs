/**
 * StrykerJS mutation testing config.
 * Scoped to sources that have unit tests (`src/**.spec.ts`, run with
 * `npm run test:unit`). Widen `mutate` as unit coverage grows.
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 */
export default {
  $schema: "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
  mutate: [
    "src/steam/format-special.ts",
    "src/webhooks/validate-webhook.middleware.ts",
    "src/webhooks/webhooks.service.ts",
  ],
  testRunner: "vitest",
  coverageAnalysis: "all",
  vitest: {
    configFile: "vitest.config.ts",
    related: true,
  },
  reporters: ["clear-text", "html", "json"],
  htmlReporter: { fileName: "reports/mutation/mutation.html" },
  jsonReporter: { fileName: "reports/mutation/mutation.json" },
  thresholds: { high: 80, low: 60, break: 50 },
  timeoutMS: 10000,
};
