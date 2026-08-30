/**
 * M0-2 — day boundaries in the user's timezone (ADR-4).
 *
 * The bug these tests exist for: V1 computes "today" as `new Date();
 * setHours(0,0,0,0)`, which is *server-local* midnight. The container runs in
 * UTC, so for a user in IST (UTC+05:30) the app believes the day rolls over at
 * 05:30 local. Between 00:00 and 05:30 IST every daily set, daily time log and
 * streak calculation is stamped to yesterday.
 *
 * The window in UTC terms: IST 00:00–05:29:59.999 on day D is UTC
 * 18:30–23:59:59.999 on day D-1. Those are the instants asserted below.
 */
import { describe, expect, it } from 'vitest';
import {
  differenceInDateKeys,
  endOfUserDay,
  formatUserDate,
  parseUserDate,
  startOfUserDay,
  userDateKey,
  userTimezone,
  weekRange
} from '../../src/utils/time';

const IST = 'Asia/Kolkata';

/**
 * What V1 does, reproduced so the tests can show the difference explicitly.
 *
 * V1's line is `new Date(); setHours(0, 0, 0, 0)`, which resolves in whatever
 * timezone the *process* runs in. In `ppt_server` that is UTC. It is written
 * out here in explicit UTC terms rather than by calling `setHours`, because
 * `setHours` would follow the developer's own machine — and this machine is
 * already in IST, where the bug happens not to reproduce. That is exactly why
 * V1 shipped with it.
 */
function v1TodayInUtcContainer(now: Date): string {
  const utcMidnight = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  return utcMidnight.toISOString().slice(0, 10);
}

describe('formatUserDate — the 00:00–05:30 IST window V1 gets wrong', () => {
  it('at 00:30 IST (18:30 UTC previous day) reports the NEW day, where V1 reports the old one', () => {
    const instant = new Date('2026-08-25T19:00:00.000Z'); // 2026-08-26 00:30 IST

    expect(formatUserDate(instant, IST)).toBe('2026-08-26');
    expect(v1TodayInUtcContainer(instant)).toBe('2026-08-25'); // the bug, pinned
  });

  it('at 05:29 IST still reports the new day', () => {
    const instant = new Date('2026-08-25T23:59:00.000Z'); // 2026-08-26 05:29 IST
    expect(formatUserDate(instant, IST)).toBe('2026-08-26');
    expect(v1TodayInUtcContainer(instant)).toBe('2026-08-25');
  });

  it('rolls over at exactly 18:30:00.000Z, not at 00:00Z', () => {
    expect(formatUserDate(new Date('2026-08-25T18:29:59.999Z'), IST)).toBe('2026-08-25');
    expect(formatUserDate(new Date('2026-08-25T18:30:00.000Z'), IST)).toBe('2026-08-26');
  });

  it('agrees with the naive UTC calculation outside the broken window', () => {
    const instant = new Date('2026-08-26T09:00:00.000Z'); // 14:30 IST — same calendar day either way
    expect(formatUserDate(instant, IST)).toBe('2026-08-26');
    expect(v1TodayInUtcContainer(instant)).toBe('2026-08-26');
  });

  it('handles the last instant of an IST day', () => {
    expect(formatUserDate(new Date('2026-08-26T18:29:59.999Z'), IST)).toBe('2026-08-26');
  });

  it('crosses a month boundary correctly', () => {
    // 2026-08-31 23:00 IST -> 2026-08-31; 2026-09-01 00:30 IST -> 2026-09-01
    expect(formatUserDate(new Date('2026-08-31T17:30:00.000Z'), IST)).toBe('2026-08-31');
    expect(formatUserDate(new Date('2026-08-31T19:00:00.000Z'), IST)).toBe('2026-09-01');
  });

  it('crosses a year boundary correctly', () => {
    expect(formatUserDate(new Date('2026-12-31T18:29:00.000Z'), IST)).toBe('2026-12-31');
    expect(formatUserDate(new Date('2026-12-31T18:30:00.000Z'), IST)).toBe('2027-01-01');
  });
});

describe('userDateKey — the value written to an @db.Date column', () => {
  it('is UTC midnight stamped with the user-local calendar date', () => {
    const key = userDateKey(new Date('2026-08-25T19:00:00.000Z'), IST);
    expect(key.toISOString()).toBe('2026-08-26T00:00:00.000Z');
  });

  it('never shifts the calendar date it was derived from', () => {
    const instant = new Date('2026-08-25T23:59:00.000Z');
    expect(userDateKey(instant, IST).toISOString().slice(0, 10)).toBe(formatUserDate(instant, IST));
  });

  it('is stable — re-keying a key returns the same key', () => {
    const key = userDateKey(new Date('2026-08-25T19:00:00.000Z'), IST);
    expect(userDateKey(key, 'UTC').toISOString()).toBe(key.toISOString());
  });
});

describe('startOfUserDay / endOfUserDay — real instants', () => {
  it('startOfUserDay is the UTC instant of local midnight', () => {
    const start = startOfUserDay(new Date('2026-08-26T09:00:00.000Z'), IST);
    expect(start.toISOString()).toBe('2026-08-25T18:30:00.000Z');
  });

  it('endOfUserDay is the last millisecond of that local day', () => {
    const end = endOfUserDay(new Date('2026-08-26T09:00:00.000Z'), IST);
    expect(end.toISOString()).toBe('2026-08-26T18:29:59.999Z');
  });

  it('an instant inside the broken window belongs to the day that starts that evening UTC', () => {
    const instant = new Date('2026-08-25T19:00:00.000Z'); // 00:30 IST on the 26th
    expect(startOfUserDay(instant, IST).toISOString()).toBe('2026-08-25T18:30:00.000Z');
    expect(endOfUserDay(instant, IST).toISOString()).toBe('2026-08-26T18:29:59.999Z');
  });

  it('start and end bracket the instant they were derived from', () => {
    const instant = new Date('2026-08-25T19:00:00.000Z');
    expect(startOfUserDay(instant, IST).getTime()).toBeLessThanOrEqual(instant.getTime());
    expect(endOfUserDay(instant, IST).getTime()).toBeGreaterThanOrEqual(instant.getTime());
  });

  it('is exactly 24h wide in a zone with no DST', () => {
    const start = startOfUserDay(new Date('2026-08-26T09:00:00.000Z'), IST);
    const end = endOfUserDay(new Date('2026-08-26T09:00:00.000Z'), IST);
    expect(end.getTime() - start.getTime()).toBe(86_400_000 - 1);
  });
});

describe('other timezones', () => {
  it('works west of UTC, where the sign of the error flips', () => {
    // 2026-08-26T03:00Z is 2026-08-25 23:00 in New York (UTC-4 in August).
    expect(formatUserDate(new Date('2026-08-26T03:00:00.000Z'), 'America/New_York')).toBe('2026-08-25');
    expect(v1TodayInUtcContainer(new Date('2026-08-26T03:00:00.000Z'))).toBe('2026-08-26');
  });

  it('handles a DST spring-forward day as 23 hours', () => {
    // US DST began 2026-03-08. That local day is 23h long.
    const inThatDay = new Date('2026-03-08T18:00:00.000Z');
    const start = startOfUserDay(inThatDay, 'America/New_York');
    const end = endOfUserDay(inThatDay, 'America/New_York');
    expect(end.getTime() - start.getTime()).toBe(23 * 3_600_000 - 1);
  });

  it('handles a DST fall-back day as 25 hours', () => {
    // US DST ended 2026-11-01. That local day is 25h long.
    const inThatDay = new Date('2026-11-01T18:00:00.000Z');
    const start = startOfUserDay(inThatDay, 'America/New_York');
    const end = endOfUserDay(inThatDay, 'America/New_York');
    expect(end.getTime() - start.getTime()).toBe(25 * 3_600_000 - 1);
  });

  it('is the identity for UTC', () => {
    expect(startOfUserDay(new Date('2026-08-26T09:00:00.000Z'), 'UTC').toISOString()).toBe(
      '2026-08-26T00:00:00.000Z'
    );
  });

  it('rejects a timezone the runtime does not know', () => {
    expect(() => formatUserDate(new Date(), 'Mars/Olympus_Mons')).toThrow();
  });
});

describe('parseUserDate — a YYYY-MM-DD from the client', () => {
  it('produces the @db.Date key for that calendar date, with no timezone shift', () => {
    expect(parseUserDate('2026-08-26').toISOString()).toBe('2026-08-26T00:00:00.000Z');
  });

  it('round-trips through formatUserDate in UTC', () => {
    expect(formatUserDate(parseUserDate('2026-08-26'), 'UTC')).toBe('2026-08-26');
  });

  it('round-trips through formatUserDate in the user timezone', () => {
    // The key is UTC midnight; read back as an IST wall clock it is 05:30 on the
    // same calendar date, so the date component must survive.
    expect(formatUserDate(parseUserDate('2026-08-26'), IST)).toBe('2026-08-26');
  });

  it('accepts a full ISO instant and keys it in the given timezone', () => {
    expect(parseUserDate('2026-08-25T19:00:00.000Z', IST).toISOString()).toBe('2026-08-26T00:00:00.000Z');
  });

  it('rejects nonsense rather than silently returning Invalid Date', () => {
    expect(() => parseUserDate('not-a-date')).toThrow(/Invalid date/);
    expect(() => parseUserDate('')).toThrow(/Invalid date/);
  });

  it('rejects an impossible calendar date instead of rolling it over', () => {
    expect(() => parseUserDate('2026-02-30')).toThrow(/Invalid date/);
    expect(() => parseUserDate('2026-13-01')).toThrow(/Invalid date/);
  });
});

describe('weekRange — the rolling 7-day window the dashboard shows', () => {
  it('ends on the user-local today and starts six days earlier', () => {
    const { start, end, days } = weekRange(new Date('2026-08-25T19:00:00.000Z'), IST);

    expect(end.toISOString()).toBe('2026-08-26T00:00:00.000Z');
    expect(start.toISOString()).toBe('2026-08-20T00:00:00.000Z');
    expect(days).toHaveLength(7);
    expect(days[0].toISOString()).toBe('2026-08-20T00:00:00.000Z');
    expect(days[6].toISOString()).toBe('2026-08-26T00:00:00.000Z');
  });

  it('emits consecutive calendar dates across a month boundary', () => {
    const { days } = weekRange(new Date('2026-09-02T09:00:00.000Z'), IST);
    expect(days.map((d) => d.toISOString().slice(0, 10))).toEqual([
      '2026-08-27',
      '2026-08-28',
      '2026-08-29',
      '2026-08-30',
      '2026-08-31',
      '2026-09-01',
      '2026-09-02'
    ]);
  });

  it('honours a custom window length', () => {
    const { days } = weekRange(new Date('2026-08-26T09:00:00.000Z'), IST, 3);
    expect(days.map((d) => d.toISOString().slice(0, 10))).toEqual([
      '2026-08-24',
      '2026-08-25',
      '2026-08-26'
    ]);
  });
});

describe('userTimezone', () => {
  it('reads USER_TIMEZONE from the environment', () => {
    expect(userTimezone({ USER_TIMEZONE: 'America/New_York' })).toBe('America/New_York');
  });

  it('defaults to Asia/Kolkata when unset (ADR-4)', () => {
    expect(userTimezone({})).toBe('Asia/Kolkata');
    expect(userTimezone({ USER_TIMEZONE: '  ' })).toBe('Asia/Kolkata');
  });

  it('never returns the server timezone', () => {
    // The whole point of ADR-4: the container's TZ must not leak into the answer.
    expect(userTimezone({ TZ: 'UTC' })).toBe('Asia/Kolkata');
  });
});

describe('differenceInDateKeys', () => {
  const key = (s: string) => parseUserDate(s);

  it('counts consecutive days as one', () => {
    expect(differenceInDateKeys(key('2026-08-26'), key('2026-08-25'))).toBe(1);
  });

  it('is zero for the same day', () => {
    expect(differenceInDateKeys(key('2026-08-26'), key('2026-08-26'))).toBe(0);
  });

  it('is negative when the arguments are the wrong way round', () => {
    expect(differenceInDateKeys(key('2026-08-25'), key('2026-08-26'))).toBe(-1);
  });

  it('counts across a month boundary', () => {
    expect(differenceInDateKeys(key('2026-09-01'), key('2026-08-31'))).toBe(1);
    expect(differenceInDateKeys(key('2026-09-02'), key('2026-08-26'))).toBe(7);
  });

  it('counts a DST transition day as one day, not 23 or 25 hours', () => {
    // A plain millisecond subtraction would give 0.958… and floor to 0 here.
    expect(differenceInDateKeys(key('2026-03-09'), key('2026-03-08'))).toBe(1);
    expect(differenceInDateKeys(key('2026-11-02'), key('2026-11-01'))).toBe(1);
  });

  it('handles a leap day', () => {
    expect(differenceInDateKeys(key('2028-03-01'), key('2028-02-28'))).toBe(2);
  });
});
