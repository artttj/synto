import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html'], ['list']],
  timeout: 30_000,
  use: {
    viewport: null,
  },
});