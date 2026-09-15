/**
 * StrykerJS mutation testing config.
 * Scoped to sources that have unit/integration tests (`src/**.test.tsx`,
 * run with `npm run test:ci`). Widen `mutate` as test coverage grows.
 *
 * tempDirName must stay dot-free: on Windows, Jest resolves `<rootDir>`
 * globs (testMatch) by escaping backslashes, which corrupts any `\.`
 * segment (e.g. the default `.stryker-tmp`) into a glob escape that matches
 * nothing, so Stryker finds zero tests.
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 */
export default {
  $schema: "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
  tempDirName: "stryker-tmp",
  mutate: [
    "src/App.tsx",
    "src/Components/AddTrackingForm.tsx",
    "src/Components/DeleteTrackingForm.tsx",
    "src/Components/Footer.tsx",
    "src/Components/Header.tsx",
    "src/Components/TrackingForm.tsx",
  ],
  testRunner: "jest",
  coverageAnalysis: "all",
  jest: {
    projectType: "create-react-app",
    enableFindRelatedTests: true,
  },
  reporters: ["clear-text", "html", "json"],
  htmlReporter: { fileName: "reports/mutation/mutation.html" },
  jsonReporter: { fileName: "reports/mutation/mutation.json" },
  thresholds: { high: 80, low: 60, break: 50 },
  timeoutMS: 10000,
};
