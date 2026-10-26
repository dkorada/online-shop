import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globalSetup: ['./tests/globalSetup.ts'],
    // Integration tests share one SQLite database, so run files one at a time.
    fileParallelism: false,
    env: {
      DATABASE_URL: 'file:./test.db',
      MOCK_PAYMENT_DELAY_MS: '0',
      SESSION_SECRET: 'test-secret',
    },
  },
});
