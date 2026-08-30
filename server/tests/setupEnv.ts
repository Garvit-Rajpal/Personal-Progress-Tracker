/**
 * Test environment setup — `docs/LLD_v2.md` §1, ADR-10.
 *
 * vitest loads this via `setupFiles` before any test module, and therefore
 * before `src/lib/prisma.ts` constructs a PrismaClient. PrismaClient reads
 * DATABASE_URL once at construction, so rewriting it here is what actually
 * points the whole suite at the test database.
 *
 * The guard itself is in `tests/testDatabaseUrl.ts` so it stays pure and
 * importable without these side effects.
 */
import path from 'path';
import dotenv from 'dotenv';
import { resolveTestDatabaseUrl } from './testDatabaseUrl';

dotenv.config({ path: path.resolve(__dirname, '..', '.env'), quiet: true });
dotenv.config({ path: path.resolve(__dirname, '..', '.env.test'), override: true, quiet: true });

process.env.DATABASE_URL = resolveTestDatabaseUrl(process.env);
process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';
process.env.USER_TIMEZONE = process.env.USER_TIMEZONE || 'Asia/Kolkata';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test_jwt_refresh_secret';
