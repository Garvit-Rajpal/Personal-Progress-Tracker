/**
 * The single PrismaClient for the process.
 *
 * ADR-13. This used to live in `src/index.ts`, which meant every service
 * imported the express entrypoint — and `index.ts` called `start()` at module
 * scope, so importing one service booted the server and ran the bootstrap
 * seed. That made the service layer untestable, which is the gap ADR-10 exists
 * to close.
 *
 * PrismaClient reads DATABASE_URL once, here, at construction. `tests/setupEnv.ts`
 * rewrites DATABASE_URL before any test module loads, which is what points the
 * suite at the test database.
 *
 * `CLAUDE.md` invariant 2 still holds: this module may only be imported from
 * `src/services/**`.
 */
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export default prisma;
