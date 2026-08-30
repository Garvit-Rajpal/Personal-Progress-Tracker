/**
 * Test-database helpers. Only ever reachable from tests, and only ever
 * pointed at DATABASE_URL_TEST — `tests/setupEnv.ts` guarantees that before
 * this module (and therefore PrismaClient) is loaded.
 */
import { prisma } from '../../src/lib/prisma';

export { prisma };

/**
 * Tables holding per-user data, in no particular order — TRUNCATE ... CASCADE
 * handles the foreign keys.
 *
 * `DSAQuestion` and `RoadmapPhase` / `RoadmapItem` are deliberately absent:
 * they are the shared catalogue (ADR-9) and tests that need them seed them
 * explicitly. Truncating them between every test would make the suite slow for
 * no benefit.
 */
const USER_SCOPED_TABLES = [
  'UserRoadmapLink',
  'UserDSAProgress',
  'UserProgress',
  'JobApplication',
  'ProjectIdea',
  'LearningTarget',
  'DailyTimeLog',
  'NextDayPlan',
  'FitnessGoal',
  'FinancialGoal',
  'Session',
  'User'
] as const;

/** Wipe all per-user rows. Safe to call in `beforeEach`. */
export async function resetUserData(): Promise<void> {
  const list = USER_SCOPED_TABLES.map((t) => `"${t}"`).join(', ');
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`);
}

/** Wipe the shared catalogue too. For tests that assert on seeding. */
export async function resetCatalogue(): Promise<void> {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "DailyDSASet", "DSAQuestion", "RoadmapItem", "RoadmapPhase" RESTART IDENTITY CASCADE'
  );
}

export async function resetAll(): Promise<void> {
  await resetUserData();
  await resetCatalogue();
}

export async function disconnect(): Promise<void> {
  await prisma.$disconnect();
}
