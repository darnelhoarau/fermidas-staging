import { defineConfig } from '@playwright/test';

const baseURL = 'http://127.0.0.1:3001';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      DATABASE_URL:
        process.env.DATABASE_URL ??
        'postgresql://user:password@127.0.0.1:5432/fermidas_test',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? baseURL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? 'test-secret',
      AUTH_SECRET: process.env.AUTH_SECRET ?? 'test-secret',
      APP_URL: process.env.APP_URL ?? baseURL,
      NODE_ENV: 'test',
    },
  },
});
