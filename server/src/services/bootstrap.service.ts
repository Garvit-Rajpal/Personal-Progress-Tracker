import { execFileSync } from 'child_process';
import { prisma } from '../lib/prisma';

export class BootstrapService {
  static async ensureSeedData() {
    const roadmapPhaseCount = await prisma.roadmapPhase.count();
    if (roadmapPhaseCount === 0) {
      execFileSync('node', ['prisma/seed.js'], { cwd: process.cwd(), stdio: 'inherit' });
    }

    const dsaQuestionCount = await prisma.dSAQuestion.count();
    if (dsaQuestionCount === 0) {
      execFileSync('node', ['prisma/seed-dsa.js'], { cwd: process.cwd(), stdio: 'inherit' });
    }
  }
}