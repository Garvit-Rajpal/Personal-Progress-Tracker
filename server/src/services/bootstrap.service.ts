import { execFileSync } from 'child_process';
import { prisma } from '../lib/prisma';
import { seedDsaQuestions } from './dsaSeed.service';

export class BootstrapService {
  static async ensureSeedData() {
    // The roadmap seed is still guarded and still shells out. Both are wrong
    // for the reasons in HLD_v2 §1.2 finding 9, and both are MB-2's job -
    // fixing them needs the curriculum parser (ADR-12) that does not exist yet.
    // Deliberately left alone; do not "improve" it here.
    const roadmapPhaseCount = await prisma.roadmapPhase.count();
    if (roadmapPhaseCount === 0) {
      execFileSync('node', ['prisma/seed.js'], { cwd: process.cwd(), stdio: 'inherit' });
    }

    // ADR-15 - the DSA half no longer needs a guard. `seedDsaQuestions` upserts
    // on (topic, title) and deletes nothing, so running it on every boot is
    // safe and is what keeps the catalogue matching the sheet.
    //
    // The previous version ran `prisma/seed-dsa.js` only when the table was
    // empty. That script is an 18-question *sample* that opens with
    // `deleteMany()`, so an empty table at boot silently replaced the full
    // 191-question sheet with a demo subset and cascaded away every solved
    // flag the user had. That is how this database lost its DSA history.
    const result = await seedDsaQuestions();
    if (result.created > 0 || result.updated > 0) {
      console.log(
        `DSA catalogue: ${result.created} added, ${result.updated} updated, ` +
          `${result.unchanged} unchanged (${result.total} total).`
      );
    }
  }
}
