#!/usr/bin/env node
/**
 * Seed the Striver SDE sheet into the catalogue.
 *
 * ADR-15. This used to be a destructive script: it opened with
 *
 *     await prisma.userDSAProgress.deleteMany({});
 *     await prisma.dailyDSASet.deleteMany({});
 *     await prisma.dSAQuestion.deleteMany({});
 *
 * and then fabricated solved history with `insertedQuestions.slice(0, 140)`.
 * Both halves were wrong. The deletes destroyed the user's real progress every
 * time the script ran, and the 140 "solved" rows were not a record of anything
 * - just the first 140 questions in insertion order, presented to the user as
 * their own achievement.
 *
 * It is now a thin CLI wrapper around `seedDsaQuestions`, which upserts on
 * (topic, title), deletes nothing, and never writes UserDSAProgress. Solved
 * state is entered through the app and belongs to the user.
 *
 *     docker exec -it ppt_server node seed-191.js
 */
require('ts-node').register({ transpileOnly: true, compilerOptions: { module: 'commonjs' } });

const path = require('path');
const { seedDsaQuestions } = require(path.join(__dirname, 'src', 'services', 'dsaSeed.service.ts'));
const { prisma } = require(path.join(__dirname, 'src', 'lib', 'prisma.ts'));

seedDsaQuestions()
  .then((result) => {
    console.log(
      `DSA catalogue: ${result.created} added, ${result.updated} updated, ` +
        `${result.unchanged} unchanged (${result.total} total).`
    );
    console.log('No solved flags were written - mark those in the app.');
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
