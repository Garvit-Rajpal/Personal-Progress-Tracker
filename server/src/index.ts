/**
 * Process entrypoint: load env, seed, listen.
 *
 * ADR-13 — routing lives in `src/app.ts` and the Prisma client in
 * `src/lib/prisma.ts`. This module exists to do the three things that must not
 * happen on import.
 */
import dotenv from 'dotenv';

// Load-bearing ordering, and the reason `./app` is imported below rather than
// at the top of the file: importing the app transitively constructs the Prisma
// client, which reads DATABASE_URL exactly once. If dotenv has not run by then,
// a local `npm run dev` gets an undefined connection string. TypeScript emits
// CommonJS requires in source order, so this holds — do not let an import
// sorter move it.
dotenv.config();

import app from './app';
import { BootstrapService } from './services/bootstrap.service';

const PORT = process.env.PORT || 5000;

async function start() {
  await BootstrapService.ensureSeedData();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
