/**
 * M0-1 acceptance, the runtime half.
 *
 * `tests/unit/testDatabaseIsolation.test.ts` proves the *guard* rejects a dev
 * connection string. This proves the guard is actually wired to the client the
 * services use: it asks postgres itself which database it is connected to.
 * Env vars can be right while the client is wrong; `current_database()` cannot.
 */
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { prisma, resetUserData, disconnect } from '../helpers/db';

afterAll(async () => {
  await disconnect();
});

describe('the prisma client the services import', () => {
  it('is connected to a database whose name ends in _test', async () => {
    const rows = await prisma.$queryRawUnsafe<Array<{ current_database: string }>>(
      'SELECT current_database()'
    );
    expect(rows[0].current_database).toMatch(/_test$/);
  });

  it('is not connected to the dev database', async () => {
    const rows = await prisma.$queryRawUnsafe<Array<{ current_database: string }>>(
      'SELECT current_database()'
    );
    expect(rows[0].current_database).not.toBe('personal_progress_assistant');
  });
});

describe('resetUserData', () => {
  beforeEach(async () => {
    await resetUserData();
  });

  it('leaves no users behind', async () => {
    await prisma.user.create({
      data: { email: 'harness@example.com', passwordHash: 'x', name: 'Harness' }
    });
    expect(await prisma.user.count()).toBe(1);

    await resetUserData();
    expect(await prisma.user.count()).toBe(0);
  });

  it('is safe to run against an already-empty database', async () => {
    await resetUserData();
    await resetUserData();
    expect(await prisma.user.count()).toBe(0);
  });
});
