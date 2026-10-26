import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT ?? 4000),
  sessionSecret: process.env.SESSION_SECRET ?? 'dev-only-session-secret',
  /** Simulated gateway latency so the "processing payment" state is visible in the UI. */
  mockPaymentDelayMs: Number(process.env.MOCK_PAYMENT_DELAY_MS ?? 900),
  /** Upper bound on a single cart line, independent of stock. */
  maxQuantityPerItem: 10,
} as const;
