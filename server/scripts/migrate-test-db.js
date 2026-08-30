#!/usr/bin/env node
/**
 * Apply migrations to the test database.
 *
 * `prisma migrate deploy` reads DATABASE_URL, so this reuses the same guard the
 * test suite uses (`tests/setupEnv.ts`) rather than trusting a shell variable:
 * if DATABASE_URL_TEST is missing, points at the dev database, or does not end
 * in `_test`, this refuses to run (ADR-10).
 */
const path = require('path');
const { execFileSync } = require('child_process');
const dotenv = require('dotenv');

const serverRoot = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(serverRoot, '.env'), quiet: true });
dotenv.config({ path: path.join(serverRoot, '.env.test'), override: true, quiet: true });

require('ts-node').register({ transpileOnly: true, compilerOptions: { module: 'commonjs' } });
const { resolveTestDatabaseUrl } = require(path.join(serverRoot, 'tests', 'testDatabaseUrl.ts'));

const url = resolveTestDatabaseUrl(process.env);
console.log(`Applying migrations to ${new URL(url).pathname.replace(/^\//, '')}`);

execFileSync('npx', ['prisma', 'migrate', 'deploy'], {
  cwd: serverRoot,
  stdio: 'inherit',
  env: { ...process.env, DATABASE_URL: url }
});
