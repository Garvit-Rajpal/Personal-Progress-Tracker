/**
 * M0-3 — the three services that resolve "today" now do it in the user's
 * timezone (ADR-4).
 *
 * Every test here pins the clock inside the window V1 gets wrong:
 * `2026-08-25T19:00:00Z` is `2026-08-26 00:30` in Asia/Kolkata. The container
 * runs in UTC, so V1 would key all of this to 2026-08-25. The assertions say
 * 2026-08-26.
 *
 * Only `Date` is faked. Faking timers wholesale would stall Prisma's own
 * internal timeouts and the suite would hang rather than fail.
 */
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma, resetAll, resetUserData, disconnect } from '../helpers/db';
import { createUser, seedDsaQuestions } from '../helpers/fixtures';
import { DSAService } from '../../src/services/dsa.service';
import { DailyTimeLogService } from '../../src/services/dailyTimeLog.service';
import { AnalyticsService } from '../../src/services/analytics.service';

/** 00:30 IST on 2026-08-26 — inside the 5h30m window V1 stamps to the 25th. */
const INSIDE_BROKEN_WINDOW = new Date('2026-08-25T19:00:00.000Z');
/** 14:30 IST on 2026-08-26 — outside it; both old and new code agree here. */
const OUTSIDE_BROKEN_WINDOW = new Date('2026-08-26T09:00:00.000Z');

function pinClock(instant: Date) {
  vi.useFakeTimers({ toFake: ['Date'], now: instant });
}

const dateKey = (d: Date) => d.toISOString().slice(0, 10);

beforeEach(async () => {
  await resetAll();
});

afterEach(() => {
  vi.useRealTimers();
});

afterAll(async () => {
  await disconnect();
});

describe('DSAService.getTodaySet', () => {
  it('keys the daily set to the user-local date, not the UTC date', async () => {
    await seedDsaQuestions();
    const user = await createUser();
    pinClock(INSIDE_BROKEN_WINDOW);

    const result = (await DSAService.getTodaySet(user.id)) as { set: { date: Date } };

    expect(dateKey(result.set.date)).toBe('2026-08-26');
  });

  it('agrees with the UTC date outside the broken window', async () => {
    await seedDsaQuestions();
    const user = await createUser();
    pinClock(OUTSIDE_BROKEN_WINDOW);

    const result = (await DSAService.getTodaySet(user.id)) as { set: { date: Date } };

    expect(dateKey(result.set.date)).toBe('2026-08-26');
  });

  it('reuses the same set across the 18:30Z rollover boundary within one IST day', async () => {
    await seedDsaQuestions();
    const user = await createUser();

    pinClock(INSIDE_BROKEN_WINDOW); // 00:30 IST on the 26th
    const first = (await DSAService.getTodaySet(user.id)) as { set: { id: string } };

    vi.setSystemTime(OUTSIDE_BROKEN_WINDOW); // 14:30 IST, same IST day
    const second = (await DSAService.getTodaySet(user.id)) as { set: { id: string } };

    expect(second.set.id).toBe(first.set.id);
    expect(await prisma.dailyDSASet.count()).toBe(1);
  });

  it('creates a new set once the IST day rolls over', async () => {
    await seedDsaQuestions();
    const user = await createUser();

    pinClock(new Date('2026-08-25T18:29:59.999Z')); // 23:59:59 IST on the 25th
    await DSAService.getTodaySet(user.id);

    vi.setSystemTime(new Date('2026-08-25T18:30:00.000Z')); // 00:00 IST on the 26th
    await DSAService.getTodaySet(user.id);

    const dates = (await prisma.dailyDSASet.findMany({ orderBy: { date: 'asc' } })).map((s) =>
      dateKey(s.date)
    );
    expect(dates).toEqual(['2026-08-25', '2026-08-26']);
  });

  it('still reports when the catalogue is empty', async () => {
    const user = await createUser();
    pinClock(INSIDE_BROKEN_WINDOW);

    expect(await DSAService.getTodaySet(user.id)).toEqual({ message: 'No questions in DB' });
  });
});

describe('DailyTimeLogService.upsert', () => {
  it('stores a YYYY-MM-DD payload on that exact calendar date', async () => {
    const user = await createUser();
    pinClock(INSIDE_BROKEN_WINDOW);

    const log = await DailyTimeLogService.upsert(user.id, {
      date: '2026-08-26',
      dsaHours: 1,
      devAiHours: 1
    });

    expect(dateKey(log.date)).toBe('2026-08-26');
  });

  it('does not shift a date-only payload by the timezone offset', async () => {
    // V1 did `new Date('2026-08-26')` then `setHours(0,0,0,0)`. In any zone
    // ahead of UTC that lands on the 25th. This is that regression, pinned.
    const user = await createUser();
    pinClock(OUTSIDE_BROKEN_WINDOW);

    await DailyTimeLogService.upsert(user.id, { date: '2026-08-26', dsaHours: 1, devAiHours: 1 });

    const stored = await prisma.dailyTimeLog.findMany();
    expect(stored).toHaveLength(1);
    expect(dateKey(stored[0].date)).toBe('2026-08-26');
  });

  it('keys a full ISO instant inside the broken window to the IST day', async () => {
    const user = await createUser();
    pinClock(INSIDE_BROKEN_WINDOW);

    const log = await DailyTimeLogService.upsert(user.id, {
      date: '2026-08-25T19:00:00.000Z',
      dsaHours: 1,
      devAiHours: 1
    });

    expect(dateKey(log.date)).toBe('2026-08-26');
  });

  it('upserts rather than duplicating when the same day is logged twice', async () => {
    const user = await createUser();
    pinClock(OUTSIDE_BROKEN_WINDOW);

    await DailyTimeLogService.upsert(user.id, { date: '2026-08-26', dsaHours: 1, devAiHours: 1 });
    await DailyTimeLogService.upsert(user.id, { date: '2026-08-26', dsaHours: 2, devAiHours: 0.5 });

    const stored = await prisma.dailyTimeLog.findMany();
    expect(stored).toHaveLength(1);
    expect(stored[0].dsaHours).toBe(2);
  });

  it('rejects an invalid date instead of writing Invalid Date', async () => {
    const user = await createUser();
    pinClock(OUTSIDE_BROKEN_WINDOW);

    await expect(
      DailyTimeLogService.upsert(user.id, { date: 'not-a-date', dsaHours: 1, devAiHours: 1 })
    ).rejects.toThrow(/Invalid date/);
    expect(await prisma.dailyTimeLog.count()).toBe(0);
  });
});

describe('DailyTimeLogService streak arithmetic', () => {
  it('counts consecutive IST days as consecutive, across the 18:30Z rollover', async () => {
    const user = await createUser();
    pinClock(new Date('2026-08-25T19:00:00.000Z')); // 00:30 IST, 26 Aug

    await DailyTimeLogService.upsert(user.id, { date: '2026-08-26', dsaHours: 1, devAiHours: 1 });
    await DailyTimeLogService.upsert(user.id, { date: '2026-08-27', dsaHours: 1, devAiHours: 1 });

    const after = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(after.streak).toBe(2);
  });

  it('does not advance the streak twice for the same day', async () => {
    const user = await createUser();
    pinClock(OUTSIDE_BROKEN_WINDOW);

    await DailyTimeLogService.upsert(user.id, { date: '2026-08-26', dsaHours: 1, devAiHours: 1 });
    await DailyTimeLogService.upsert(user.id, { date: '2026-08-26', dsaHours: 2, devAiHours: 2 });

    const after = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(after.streak).toBe(1);
  });

  it('resets the streak after an unfrozen gap', async () => {
    const user = await createUser();
    pinClock(OUTSIDE_BROKEN_WINDOW);

    await DailyTimeLogService.upsert(user.id, { date: '2026-08-20', dsaHours: 1, devAiHours: 1 });
    await DailyTimeLogService.upsert(user.id, { date: '2026-08-26', dsaHours: 1, devAiHours: 1 });

    const after = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(after.streak).toBe(1);
  });

  it('only counts a day that has both DSA and dev/AI hours', async () => {
    const user = await createUser();
    pinClock(OUTSIDE_BROKEN_WINDOW);

    await DailyTimeLogService.upsert(user.id, { date: '2026-08-26', dsaHours: 1, devAiHours: 0 });

    const after = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(after.streak).toBe(0);
  });
});

describe('AnalyticsService.getOverview', () => {
  it('reports today as the user-local day, not the UTC day', async () => {
    const user = await createUser();
    pinClock(INSIDE_BROKEN_WINDOW);

    await DailyTimeLogService.upsert(user.id, { date: '2026-08-26', dsaHours: 1.5, devAiHours: 0.5 });
    const overview = await AnalyticsService.getOverview(user.id);

    expect(overview.timeTracking.today).toEqual({ dsaHours: 1.5, devAiHours: 0.5 });
  });

  it('ends the seven-day trend on the user-local today', async () => {
    const user = await createUser();
    pinClock(INSIDE_BROKEN_WINDOW);

    const overview = await AnalyticsService.getOverview(user.id);
    const dates = overview.timeTracking.weekTrend.map((d) => d.date);

    expect(dates).toHaveLength(7);
    expect(dates[6]).toBe('2026-08-26');
    expect(dates[0]).toBe('2026-08-20');
  });

  it('places a log on the right day of the trend', async () => {
    const user = await createUser();
    pinClock(INSIDE_BROKEN_WINDOW);

    await DailyTimeLogService.upsert(user.id, { date: '2026-08-24', dsaHours: 2, devAiHours: 1 });
    const overview = await AnalyticsService.getOverview(user.id);
    const day = overview.timeTracking.weekTrend.find((d) => d.date === '2026-08-24');

    expect(day).toEqual({ date: '2026-08-24', dsaHours: 2, devAiHours: 1, totalHours: 3 });
  });

  it('excludes a log that falls outside the seven-day window', async () => {
    const user = await createUser();
    pinClock(INSIDE_BROKEN_WINDOW);

    await DailyTimeLogService.upsert(user.id, { date: '2026-08-19', dsaHours: 9, devAiHours: 9 });
    const overview = await AnalyticsService.getOverview(user.id);

    expect(overview.timeTracking.week).toEqual({ dsaHours: 0, devAiHours: 0 });
  });

  it('includes the boundary day at the start of the window', async () => {
    const user = await createUser();
    pinClock(INSIDE_BROKEN_WINDOW);

    await DailyTimeLogService.upsert(user.id, { date: '2026-08-20', dsaHours: 1, devAiHours: 1 });
    const overview = await AnalyticsService.getOverview(user.id);

    expect(overview.timeTracking.week).toEqual({ dsaHours: 1, devAiHours: 1 });
  });

  it('does not create rows as a side effect of being read (invariant 6)', async () => {
    const user = await createUser();
    pinClock(INSIDE_BROKEN_WINDOW);

    await AnalyticsService.getOverview(user.id);

    expect(await prisma.dailyTimeLog.count()).toBe(0);
    expect(await prisma.dailyDSASet.count()).toBe(0);
  });
});

describe('user scoping (invariant 1)', () => {
  it("does not leak another user's time logs into the overview", async () => {
    const mine = await createUser();
    const theirs = await createUser();
    pinClock(INSIDE_BROKEN_WINDOW);

    await DailyTimeLogService.upsert(theirs.id, { date: '2026-08-26', dsaHours: 5, devAiHours: 5 });
    const overview = await AnalyticsService.getOverview(mine.id);

    expect(overview.timeTracking.today).toEqual({ dsaHours: 0, devAiHours: 0 });
  });

  it('keeps two users on independent streaks', async () => {
    const a = await createUser();
    const b = await createUser();
    pinClock(OUTSIDE_BROKEN_WINDOW);

    await DailyTimeLogService.upsert(a.id, { date: '2026-08-25', dsaHours: 1, devAiHours: 1 });
    await DailyTimeLogService.upsert(a.id, { date: '2026-08-26', dsaHours: 1, devAiHours: 1 });
    await DailyTimeLogService.upsert(b.id, { date: '2026-08-26', dsaHours: 1, devAiHours: 1 });

    expect((await prisma.user.findUniqueOrThrow({ where: { id: a.id } })).streak).toBe(2);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: b.id } })).streak).toBe(1);
  });
});
