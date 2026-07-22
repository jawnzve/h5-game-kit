// @ts-check
const { defineConfig } = require('@playwright/test');

const baseURL = process.env.H5_BASE_URL || 'http://localhost:3100';

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: process.env.H5_SKIP_WEBSERVER
    ? undefined
    : {
        command: 'npm start',
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
