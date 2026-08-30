import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    // setupEnv runs before every test module so PrismaClient is constructed
    // against DATABASE_URL_TEST and never the dev database (ADR-10).
    setupFiles: ['./tests/setupEnv.ts'],
    include: ['tests/**/*.test.ts'],
    // Service and integration tests truncate shared tables, so test files must
    // not run concurrently against the one test database.
    fileParallelism: false,
    testTimeout: 20_000,
    hookTimeout: 30_000
  }
});
