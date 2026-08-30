/**
 * Day boundaries, computed in the *user's* timezone — never the server's.
 *
 * ADR-4. V1 computed "today" as `new Date(); setHours(0, 0, 0, 0)`, which is
 * server-local midnight. The container runs in UTC, so for a user in IST
 * (UTC+05:30) the day appeared to roll over at 05:30 local: every daily DSA
 * set, daily time log and streak calculation was stamped to yesterday for five
 * and a half hours out of every twenty-four.
 *
 * The rejected fix was setting `TZ=Asia/Kolkata` on the container. That treats
 * the symptom, hides the bug from tests, and breaks the moment a second user
 * lives in a second timezone.
 *
 * No date library: `Intl.DateTimeFormat` with an explicit `timeZone` is in the
 * Node runtime, is DST-correct, and adds no dependency to audit.
 *
 * ## Two different things that both look like "a date"
 *
 * Be deliberate about which one a caller needs:
 *
 * - **A date key** (`userDateKey`, `parseUserDate`) — the value written to a
 *   Prisma `@db.Date` column. Prisma serialises those from the *UTC* component
 *   of a JS Date, so the key for "26 Aug in Kolkata" is `2026-08-26T00:00:00Z`.
 *   It is a label for a calendar day, not a moment in time.
 * - **An instant** (`startOfUserDay`, `endOfUserDay`) — the actual moment local
 *   midnight occurs, e.g. `2026-08-25T18:30:00Z` for 26 Aug in Kolkata. Use
 *   these to bound a `DateTime` column.
 *
 * Mixing them up is the same class of bug ADR-4 is fixing, so they are named
 * differently and tested separately.
 */

const DEFAULT_TIMEZONE = 'Asia/Kolkata';
const MS_PER_DAY = 86_400_000;
const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * The timezone every day boundary in this app is computed in.
 *
 * Reads `USER_TIMEZONE` and falls back to Asia/Kolkata. It deliberately never
 * consults `TZ` or the host clock — ADR-4 is precisely about not letting the
 * server's timezone decide what day it is for the user.
 *
 * V2 is single-user, so this is process-wide config. When V3 makes it
 * per-user (ADR-9) this becomes a lookup on the user row and every call site
 * already takes the zone as an argument.
 */
export function userTimezone(env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env): string {
  const configured = env.USER_TIMEZONE?.trim();
  return configured ? configured : DEFAULT_TIMEZONE;
}

interface WallClock {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

/** Cached per zone — constructing a DateTimeFormat is comparatively expensive. */
const formatterCache = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatterCache.get(timeZone);
  if (!formatter) {
    // Throws RangeError on an unknown zone, which is what we want: a typo in
    // USER_TIMEZONE must fail loudly rather than silently fall back to UTC.
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    formatterCache.set(timeZone, formatter);
  }
  return formatter;
}

/** The wall-clock reading in `timeZone` at the given instant. */
function wallClockAt(instant: Date, timeZone: string): WallClock {
  const parts = formatterFor(timeZone).formatToParts(instant);
  const get = (type: Intl.DateTimeFormatPartTypes) => {
    const part = parts.find((p) => p.type === type);
    if (!part) throw new Error(`Intl gave no "${type}" for timezone ${timeZone}`);
    return Number(part.value);
  };

  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
    second: get('second')
  };
}

/** How far ahead of UTC `timeZone` is at `instant`, in milliseconds. */
function offsetMsAt(instant: Date, timeZone: string): number {
  const wall = wallClockAt(instant, timeZone);
  const asIfUtc = Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute, wall.second);
  // Intl gives whole seconds; keep the instant's sub-second part out of the offset.
  return asIfUtc - (instant.getTime() - instant.getMilliseconds());
}

function assertValid(date: Date, label: string): Date {
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid date: ${label}`);
  return date;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * The user-local calendar date as `YYYY-MM-DD`.
 *
 * This is the function that fixes the 00:00–05:30 IST window: at
 * `2026-08-25T19:00:00Z` it returns `2026-08-26`, where V1's UTC calculation
 * returned `2026-08-25`.
 */
export function formatUserDate(instant: Date, timeZone: string = userTimezone()): string {
  assertValid(instant, String(instant));
  const wall = wallClockAt(instant, timeZone);
  return `${wall.year}-${pad(wall.month)}-${pad(wall.day)}`;
}

/**
 * The `@db.Date` key for the user-local calendar day containing `instant`:
 * UTC midnight stamped with that local date.
 */
export function userDateKey(instant: Date = new Date(), timeZone: string = userTimezone()): Date {
  return new Date(`${formatUserDate(instant, timeZone)}T00:00:00.000Z`);
}

/**
 * The instant at which the user-local day containing `instant` begins.
 *
 * Two passes, because the offset at local midnight is not necessarily the
 * offset at `instant` — on a DST transition day they differ. The first pass
 * guesses using the offset at `instant`; the second re-reads the offset at the
 * guess and corrects. That converges for every real-world zone.
 */
export function startOfUserDay(instant: Date = new Date(), timeZone: string = userTimezone()): Date {
  assertValid(instant, String(instant));
  const wall = wallClockAt(instant, timeZone);
  const localMidnightAsIfUtc = Date.UTC(wall.year, wall.month - 1, wall.day);

  const firstGuess = new Date(localMidnightAsIfUtc - offsetMsAt(instant, timeZone));
  const corrected = new Date(localMidnightAsIfUtc - offsetMsAt(firstGuess, timeZone));

  return corrected;
}

/** The last millisecond of the user-local day containing `instant`. */
export function endOfUserDay(instant: Date = new Date(), timeZone: string = userTimezone()): Date {
  const start = startOfUserDay(instant, timeZone);
  // Step well inside the next local day before re-resolving its start, so a
  // 23-hour DST day cannot land back inside the day we came from.
  const nextDayStart = startOfUserDay(new Date(start.getTime() + MS_PER_DAY + 3 * 3_600_000), timeZone);
  return new Date(nextDayStart.getTime() - 1);
}

/**
 * Normalise a client-supplied date into an `@db.Date` key.
 *
 * A bare `YYYY-MM-DD` is taken at face value — it is already a calendar date
 * and must not be shifted by anyone's timezone. Anything else is parsed as an
 * instant and keyed in `timeZone`.
 *
 * V1's `new Date(payload.date)` followed by `setHours(0,0,0,0)` did shift it,
 * which is how a log entered at 00:30 IST landed on the previous day.
 */
export function parseUserDate(value: string, timeZone: string = userTimezone()): Date {
  const trimmed = value?.trim();
  if (!trimmed) throw new Error(`Invalid date: ${JSON.stringify(value)}`);

  const dateOnly = DATE_ONLY.exec(trimmed);
  if (dateOnly) {
    const [, y, m, d] = dateOnly;
    const key = new Date(`${y}-${m}-${d}T00:00:00.000Z`);
    assertValid(key, trimmed);
    // `new Date('2026-02-30')` is Invalid, but `new Date('2026-04-31')` is not
    // in every engine — verify the components survived the round trip.
    if (
      key.getUTCFullYear() !== Number(y) ||
      key.getUTCMonth() + 1 !== Number(m) ||
      key.getUTCDate() !== Number(d)
    ) {
      throw new Error(`Invalid date: ${trimmed}`);
    }
    return key;
  }

  const instant = new Date(trimmed);
  assertValid(instant, trimmed);
  return userDateKey(instant, timeZone);
}

/**
 * Whole days between two `@db.Date` keys, positive when `later` is the later
 * day. Both arguments must be keys (UTC midnight) — that is what makes this
 * immune to DST, where a plain millisecond subtraction is not.
 */
export function differenceInDateKeys(later: Date, earlier: Date): number {
  const toDayNumber = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Math.round((toDayNumber(later) - toDayNumber(earlier)) / MS_PER_DAY);
}

export interface WeekRange {
  /** `@db.Date` key of the first day in the window. */
  start: Date;
  /** `@db.Date` key of the last day in the window (the user-local today). */
  end: Date;
  /** Every `@db.Date` key in the window, ascending. */
  days: Date[];
}

/**
 * The rolling window ending on the user-local day containing `instant`.
 *
 * Returns date *keys*, because every caller uses them against `@db.Date`
 * columns. Days are stepped by calendar date rather than by adding 24h, so a
 * DST transition inside the window cannot drop or duplicate a day.
 */
export function weekRange(
  instant: Date = new Date(),
  timeZone: string = userTimezone(),
  days = 7
): WeekRange {
  if (!Number.isInteger(days) || days < 1) {
    throw new Error(`weekRange needs a positive whole number of days, got ${days}`);
  }

  const end = userDateKey(instant, timeZone);
  const keys: Date[] = [];

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    keys.push(
      new Date(
        Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() - offset)
      )
    );
  }

  return { start: keys[0], end, days: keys };
}
