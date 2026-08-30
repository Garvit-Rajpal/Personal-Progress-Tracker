/**
 * M0-1 acceptance: a test can never reach the dev database.
 *
 * `docs/LLD_v2.md` §1 requires this by *construction*, not by discipline, so
 * the guard lives in a pure function that `tests/setupEnv.ts` calls at import
 * time. Testing the function directly is what makes the guarantee auditable.
 */
import { describe, expect, it } from 'vitest';
import { resolveTestDatabaseUrl } from '../testDatabaseUrl';

const DEV = 'postgresql://postgres:password@localhost:5433/personal_progress_assistant?schema=public';
const TEST = 'postgresql://postgres:password@localhost:5433/personal_progress_assistant_test?schema=public';

describe('resolveTestDatabaseUrl', () => {
  it('returns DATABASE_URL_TEST when it is a distinct _test database', () => {
    expect(resolveTestDatabaseUrl({ DATABASE_URL: DEV, DATABASE_URL_TEST: TEST })).toBe(TEST);
  });

  it('throws when DATABASE_URL_TEST is missing', () => {
    expect(() => resolveTestDatabaseUrl({ DATABASE_URL: DEV })).toThrow(/DATABASE_URL_TEST/);
  });

  it('throws when DATABASE_URL_TEST is blank', () => {
    expect(() => resolveTestDatabaseUrl({ DATABASE_URL: DEV, DATABASE_URL_TEST: '   ' })).toThrow(
      /DATABASE_URL_TEST/
    );
  });

  it('throws when DATABASE_URL_TEST is the dev database verbatim', () => {
    expect(() => resolveTestDatabaseUrl({ DATABASE_URL: DEV, DATABASE_URL_TEST: DEV })).toThrow(
      /must not be the same database as DATABASE_URL/
    );
  });

  it('throws when the two URLs differ only cosmetically but name the same database', () => {
    expect(() =>
      resolveTestDatabaseUrl({
        DATABASE_URL: DEV,
        // same host, port and database name; different query string
        DATABASE_URL_TEST:
          'postgresql://postgres:password@localhost:5433/personal_progress_assistant?schema=public&connection_limit=1'
      })
    ).toThrow(/must not be the same database as DATABASE_URL/);
  });

  it('throws when the test database name does not end in _test', () => {
    expect(() =>
      resolveTestDatabaseUrl({
        DATABASE_URL: DEV,
        DATABASE_URL_TEST: 'postgresql://postgres:password@localhost:5433/scratch?schema=public'
      })
    ).toThrow(/_test/);
  });

  it('throws on a malformed DATABASE_URL_TEST rather than falling back', () => {
    expect(() =>
      resolveTestDatabaseUrl({ DATABASE_URL: DEV, DATABASE_URL_TEST: 'not-a-url' })
    ).toThrow();
  });
});

describe('the running test process', () => {
  it('has had DATABASE_URL rewritten to DATABASE_URL_TEST by tests/setupEnv.ts', () => {
    expect(process.env.DATABASE_URL_TEST).toBeTruthy();
    expect(process.env.DATABASE_URL).toBe(process.env.DATABASE_URL_TEST);
  });

  it('points at a database whose name ends in _test', () => {
    const name = new URL(process.env.DATABASE_URL as string).pathname.replace(/^\//, '');
    expect(name).toMatch(/_test$/);
  });
});
