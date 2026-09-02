/**
 * The DSA catalogue seed is idempotent and never destroys progress.
 *
 * This exists because it already went wrong. `prisma/seed-dsa.js` opens with
 * `dSAQuestion.deleteMany()`, and `UserDSAProgress.questionId` cascades on
 * delete — so every run silently took the user's solved history with it. The
 * dev database was found with 191 questions' worth of sheet reduced to an
 * 18-question sample and zero progress rows.
 *
 * `CLAUDE.md` invariant 7 already required idempotent seeds. This is the test
 * that makes the requirement real for the DSA half (ADR-15).
 */
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { seedDsaQuestions, SHEET_SIZE } from '../../src/services/dsaSeed.service';
import { prisma, resetAll, disconnect } from '../helpers/db';
import { createUser } from '../helpers/fixtures';

beforeEach(async () => {
  await resetAll();
});

afterAll(async () => {
  await disconnect();
});

describe('seedDsaQuestions — first run', () => {
  it('loads the whole sheet, not a sample', async () => {
    await seedDsaQuestions();
    expect(await prisma.dSAQuestion.count()).toBe(SHEET_SIZE);
  });

  it('loads all 191 questions', async () => {
    await seedDsaQuestions();
    expect(await prisma.dSAQuestion.count()).toBe(191);
  });

  it('covers every topic in the sheet', async () => {
    await seedDsaQuestions();
    const topics = await prisma.dSAQuestion.groupBy({ by: ['topic'] });
    expect(topics).toHaveLength(27);
  });

  it('reports what it did', async () => {
    const result = await seedDsaQuestions();
    expect(result).toMatchObject({ created: 191, updated: 0, unchanged: 0 });
  });
});

describe('seedDsaQuestions — re-running', () => {
  it('creates no duplicates', async () => {
    await seedDsaQuestions();
    await seedDsaQuestions();
    expect(await prisma.dSAQuestion.count()).toBe(191);
  });

  it('reports everything as unchanged the second time', async () => {
    await seedDsaQuestions();
    const second = await seedDsaQuestions();
    expect(second).toMatchObject({ created: 0, updated: 0, unchanged: 191 });
  });

  it('keeps the same row ids, so nothing referencing them breaks', async () => {
    await seedDsaQuestions();
    const before = (await prisma.dSAQuestion.findMany({ orderBy: { title: 'asc' } })).map((q) => q.id);

    await seedDsaQuestions();
    const after = (await prisma.dSAQuestion.findMany({ orderBy: { title: 'asc' } })).map((q) => q.id);

    expect(after).toEqual(before);
  });
});

describe('solved history survives a re-seed — the whole point', () => {
  it('does not delete UserDSAProgress', async () => {
    await seedDsaQuestions();
    const user = await createUser();
    const questions = await prisma.dSAQuestion.findMany({ take: 144 });

    await prisma.userDSAProgress.createMany({
      data: questions.map((q) => ({ userId: user.id, questionId: q.id, solved: true, solvedAt: new Date() }))
    });
    expect(await prisma.userDSAProgress.count({ where: { solved: true } })).toBe(144);

    await seedDsaQuestions();

    expect(await prisma.userDSAProgress.count({ where: { solved: true } })).toBe(144);
  });

  it('keeps progress attached to the same questions', async () => {
    await seedDsaQuestions();
    const user = await createUser();
    const question = await prisma.dSAQuestion.findFirstOrThrow({ where: { title: 'Set Matrix Zeroes' } });
    await prisma.userDSAProgress.create({
      data: { userId: user.id, questionId: question.id, solved: true, notes: 'row/col markers' }
    });

    await seedDsaQuestions();

    const progress = await prisma.userDSAProgress.findFirstOrThrow({
      where: { userId: user.id },
      include: { question: true }
    });
    expect(progress.question.title).toBe('Set Matrix Zeroes');
    expect(progress.solved).toBe(true);
    expect(progress.notes).toBe('row/col markers');
  });

  it('survives ten consecutive re-seeds', async () => {
    await seedDsaQuestions();
    const user = await createUser();
    const q = await prisma.dSAQuestion.findFirstOrThrow();
    await prisma.userDSAProgress.create({ data: { userId: user.id, questionId: q.id, solved: true } });

    for (let i = 0; i < 10; i += 1) await seedDsaQuestions();

    expect(await prisma.userDSAProgress.count({ where: { solved: true } })).toBe(1);
    expect(await prisma.dSAQuestion.count()).toBe(191);
  });

  it('does not delete DailyDSASet rows either', async () => {
    await seedDsaQuestions();
    const questions = await prisma.dSAQuestion.findMany({ take: 3 });
    await prisma.dailyDSASet.create({
      data: { date: new Date('2026-08-26T00:00:00.000Z'), questions: { connect: questions.map((q) => ({ id: q.id })) } }
    });

    await seedDsaQuestions();

    const set = await prisma.dailyDSASet.findFirstOrThrow({ include: { questions: true } });
    expect(set.questions).toHaveLength(3);
  });
});

describe('repairing a database that holds the 18-question sample', () => {
  it('tops it up to the full sheet without dropping the overlap', async () => {
    // The exact state the dev database was found in.
    await prisma.dSAQuestion.createMany({
      data: [
        { title: 'Set Matrix Zeroes', topic: 'Arrays', difficulty: 'MEDIUM', link: 'https://old.test/1' },
        { title: 'Next Permutation', topic: 'Arrays', difficulty: 'MEDIUM', link: 'https://old.test/2' }
      ]
    });
    const user = await createUser();
    const kept = await prisma.dSAQuestion.findFirstOrThrow({ where: { title: 'Set Matrix Zeroes' } });
    await prisma.userDSAProgress.create({ data: { userId: user.id, questionId: kept.id, solved: true } });

    const result = await seedDsaQuestions();

    expect(await prisma.dSAQuestion.count()).toBe(191);
    expect(result.created).toBe(189);
    // The two that already existed were kept, not recreated — so the progress
    // pointing at them is still there.
    expect(await prisma.userDSAProgress.count({ where: { solved: true } })).toBe(1);
  });

  it('corrects a stale link on a question it already has', async () => {
    await prisma.dSAQuestion.create({
      data: { title: 'Set Matrix Zeroes', topic: 'Arrays', difficulty: 'EASY', link: 'https://stale.test/x' }
    });

    const result = await seedDsaQuestions();
    const q = await prisma.dSAQuestion.findFirstOrThrow({ where: { title: 'Set Matrix Zeroes' } });

    expect(q.link).not.toBe('https://stale.test/x');
    expect(q.difficulty).toBe('MEDIUM');
    expect(result.updated).toBe(1);
  });
});
