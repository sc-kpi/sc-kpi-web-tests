import { defineConfig, devices } from "@playwright/test";
import { BASIC_STORAGE_STATE } from "./src/auth/storage-state.js";
import { Config } from "./src/config/config.js";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: Config.execution().parallel,
  forbidOnly: !!process.env.CI,
  retries: Config.retry().maxAttempts,
  workers: Config.execution().workers,
  timeout: Config.timeout(),

  reporter: [
    ["list"],
    ["html", { open: "never" }],
    [
      "allure-playwright",
      {
        resultsDir: "allure-results",
        environmentInfo: {
          BASE_URL: Config.baseUrl(),
          TEST_ENV: process.env.TEST_ENV ?? "default",
          AUTH_ENABLED: String(Config.isAuthEnabled()),
          NODE_VERSION: process.version,
        },
      },
    ],
    ["junit", { outputFile: "test-results/junit.xml" }],
  ],

  use: {
    baseURL: Config.baseUrl(),
    locale: Config.browser().locale,
    timezoneId: "Europe/Kyiv",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "auth-setup",
      testDir: "./src/auth",
      testMatch: "auth.setup.ts",
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: BASIC_STORAGE_STATE,
      },
      dependencies: ["auth-setup"],
    },
    {
      name: "mobile-chrome",
      use: {
        ...devices["Pixel 5"],
        storageState: BASIC_STORAGE_STATE,
      },
      dependencies: ["auth-setup"],
    },
  ],
});
