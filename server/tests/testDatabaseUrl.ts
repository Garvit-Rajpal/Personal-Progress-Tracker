/**
 * The test-database guard — pure, side-effect free, and therefore directly
 * assertable (`tests/unit/testDatabaseIsolation.test.ts`).
 *
 * `docs/LLD_v2.md` §1 requires that a test can never reach the dev database
 * *by construction*. That is this file. `tests/setupEnv.ts` applies it to the
 * running process; `scripts/migrate-test-db.js` applies it to prisma CLI runs.
 * There is deliberately no default value anywhere — a silent fallback is how a
 * suite ends up truncating real personal data (ADR-10).
 */

/** The database name a postgres connection string points at, lowercased. */
export function databaseNameOf(url: string): string {
  const parsed = new URL(url);
  const name = decodeURIComponent(parsed.pathname).replace(/^\//, '').trim();
  if (!name) throw new Error(`Connection string names no database: ${url}`);
  return name.toLowerCase();
}

/** host:port:database — the identity that actually decides whose data you destroy. */
function targetOf(url: string): string {
  const parsed = new URL(url);
  return `${parsed.hostname}:${parsed.port}:${databaseNameOf(url)}`.toLowerCase();
}

/**
 * Resolve the connection string tests are allowed to use, or throw. Guards, in
 * order:
 *   1. `DATABASE_URL_TEST` present and non-blank.
 *   2. Parseable as a URL, and names a database.
 *   3. Does not resolve to the same host:port:database as `DATABASE_URL`.
 *   4. Its database name ends in `_test`.
 *
 * Rule 4 is the belt to rule 3's braces: it still holds if someone edits
 * `DATABASE_URL` in a way that accidentally makes rule 3 pass.
 */
export function resolveTestDatabaseUrl(
  env: NodeJS.ProcessEnv | Record<string, string | undefined>
): string {
  const testUrl = env.DATABASE_URL_TEST?.trim();

  if (!testUrl) {
    throw new Error(
      'DATABASE_URL_TEST is not set. Tests refuse to run without a dedicated test ' +
        'database — see docs/LLD_v2.md §1 and server/.env.example.'
    );
  }

  const testTarget = targetOf(testUrl);
  const devUrl = env.DATABASE_URL?.trim();

  if (devUrl) {
    let devTarget: string | null = null;
    try {
      devTarget = targetOf(devUrl);
    } catch {
      // An unparseable DATABASE_URL cannot be the thing we are protecting.
      devTarget = null;
    }

    if (devTarget && devTarget === testTarget) {
      throw new Error(
        `DATABASE_URL_TEST must not be the same database as DATABASE_URL (both resolve to ${testTarget}).`
      );
    }
  }

  if (!databaseNameOf(testUrl).endsWith('_test')) {
    throw new Error(
      `DATABASE_URL_TEST must name a database ending in _test (got "${databaseNameOf(testUrl)}"). ` +
        'This is the guard that stops a mistyped connection string from truncating real data.'
    );
  }

  return testUrl;
}
