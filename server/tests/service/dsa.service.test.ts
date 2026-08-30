/**
 * M0-6 — service tests for the existing DSA service.
 *
 * The day-boundary behaviour is covered in `dayBoundary.service.test.ts`;
 * this file covers everything else the service promises, so MB-6 (which
 * replaces `slice(0, 3)` with the configured target) has something to break.
 */
import { afterAll, beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { DSAService } from '../../src/services/dsa.service';
import { prisma, resetAll, disconnect } from '../helpers/db';
import { createUser, seedDsaQuestions } from '../helpers/fixtures';

beforeEach(async () => {
  await resetAll();
});

afterEach(() => {
  vi.useRealTimers();
});

afterAll(async () => {
  await disconnect();
});

describe('DSAService.getAllQuestions', () => {
  it('returns every catalogue question', async () => {
    await seedDsaQuestions(5);
    const user = await createUser();

    const { questions } = await DSAService.getAllQuestions(user.id);
    expect(questions).toHaveLength(5);
  });

  it('orders questions by the canonical Striver sheet, not by id', async () => {
    // Inserted deliberately out of sheet order; `191_striver_questions.json`
    // puts "Set Matrix Zeroes" before "Next Permutation".
    await prisma.dSAQuestion.create({
      data: { title: 'Next Permutation', topic: 'Arrays', difficulty: 'MEDIUM', link: 'https://e.test/2' }
    });
    await prisma.dSAQuestion.create({
      data: { title: 'Set Matrix Zeroes', topic: 'Arrays', difficulty: 'MEDIUM', link: 'https://e.test/1' }
    });
    const user = await createUser();

    const { questions } = await DSAService.getAllQuestions(user.id);
    expect(questions.map((q) => q.title)).toEqual(['Set Matrix Zeroes', 'Next Permutation']);
  });

  it('includes the canonical sheet link', async () => {
    const user = await createUser();
    const { canonicalSheetLink } = await DSAService.getAllQuestions(user.id);

    expect(canonicalSheetLink).toContain('takeuforward.org');
  });

  it('returns only the calling user’s progress (invariant 1)', async () => {
    const [question] = await seedDsaQuestions(1);
    const mine = await createUser();
    const theirs = await createUser();

    await DSAService.toggleSolved(theirs.id, question.id, true);
    const { progress } = await DSAService.getAllQuestions(mine.id);

    expect(progress).toEqual([]);
  });

  it('copes with an empty catalogue', async () => {
    const user = await createUser();
    const { questions } = await DSAService.getAllQuestions(user.id);

    expect(questions).toEqual([]);
  });
});

describe('DSAService.getTodaySet', () => {
  it('returns the set together with the user’s progress on it', async () => {
    await seedDsaQuestions();
    const user = await createUser();

    const result = (await DSAService.getTodaySet(user.id)) as {
      set: { questions: Array<{ id: string }> };
      progress: unknown[];
    };

    expect(result.set.questions.length).toBeGreaterThan(0);
    expect(result.progress).toEqual([]);
  });

  it("does not include another user's progress in the set (invariant 1)", async () => {
    await seedDsaQuestions();
    const mine = await createUser();
    const theirs = await createUser();

    const seeded = (await DSAService.getTodaySet(theirs.id)) as { set: { questions: Array<{ id: string }> } };
    await DSAService.toggleSolved(theirs.id, seeded.set.questions[0].id, true);

    const result = (await DSAService.getTodaySet(mine.id)) as { progress: unknown[] };
    expect(result.progress).toEqual([]);
  });

  it('picks questions from the top of the canonical order', async () => {
    await seedDsaQuestions(7);
    const user = await createUser();

    const result = (await DSAService.getTodaySet(user.id)) as {
      set: { questions: Array<{ title: string }> };
    };
    const { questions: all } = await DSAService.getAllQuestions(user.id);

    const chosen = result.set.questions.map((q) => q.title).sort();
    const expected = all.slice(0, result.set.questions.length).map((q) => q.title).sort();
    expect(chosen).toEqual(expected);
  });

  // MB-6 replaces this constant with LearningTarget.dailyDsaTarget (ADR-7).
  // Pinned here so that milestone has a failing test to turn green, and so the
  // current behaviour is recorded rather than assumed.
  it('currently returns a hardcoded three questions (removed in MB-6)', async () => {
    await seedDsaQuestions(7);
    const user = await createUser();

    const result = (await DSAService.getTodaySet(user.id)) as { set: { questions: unknown[] } };
    expect(result.set.questions).toHaveLength(3);
  });
});

describe('DSAService.toggleSolved', () => {
  it('creates a progress row on first solve and stamps solvedAt', async () => {
    const [question] = await seedDsaQuestions(1);
    const user = await createUser();

    const progress = await DSAService.toggleSolved(user.id, question.id, true);

    expect(progress.solved).toBe(true);
    expect(progress.solvedAt).toBeInstanceOf(Date);
  });

  it('clears solvedAt when un-solved', async () => {
    const [question] = await seedDsaQuestions(1);
    const user = await createUser();

    await DSAService.toggleSolved(user.id, question.id, true);
    const progress = await DSAService.toggleSolved(user.id, question.id, false);

    expect(progress.solved).toBe(false);
    expect(progress.solvedAt).toBeNull();
  });

  it('upserts rather than creating a second row', async () => {
    const [question] = await seedDsaQuestions(1);
    const user = await createUser();

    await DSAService.toggleSolved(user.id, question.id, true);
    await DSAService.toggleSolved(user.id, question.id, false);

    expect(await prisma.userDSAProgress.count({ where: { userId: user.id } })).toBe(1);
  });

  it('keeps two users’ progress on the same question separate (invariant 1)', async () => {
    const [question] = await seedDsaQuestions(1);
    const a = await createUser();
    const b = await createUser();

    await DSAService.toggleSolved(a.id, question.id, true);
    await DSAService.toggleSolved(b.id, question.id, false);

    const rows = await prisma.userDSAProgress.findMany({ where: { questionId: question.id } });
    expect(rows).toHaveLength(2);
    expect(rows.filter((r) => r.solved)).toHaveLength(1);
  });
});

describe('DSAService.updateNotes', () => {
  it('saves notes against the question', async () => {
    const [question] = await seedDsaQuestions(1);
    const user = await createUser();

    const progress = await DSAService.updateNotes(user.id, question.id, 'two pointers');
    expect(progress.notes).toBe('two pointers');
  });

  it('does not clear the solved flag when notes are edited', async () => {
    const [question] = await seedDsaQuestions(1);
    const user = await createUser();

    await DSAService.toggleSolved(user.id, question.id, true);
    const progress = await DSAService.updateNotes(user.id, question.id, 'revisit');

    expect(progress.solved).toBe(true);
  });

  it('does not clear notes when the solved flag is toggled', async () => {
    const [question] = await seedDsaQuestions(1);
    const user = await createUser();

    await DSAService.updateNotes(user.id, question.id, 'keep me');
    const progress = await DSAService.toggleSolved(user.id, question.id, true);

    expect(progress.notes).toBe('keep me');
  });
});
