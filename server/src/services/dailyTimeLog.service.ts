import { prisma } from '../lib/prisma';
import { differenceInDateKeys, parseUserDate, userDateKey } from '../utils/time';

export class DailyTimeLogService {
  private static readonly MAX_FREEZE_DAYS = 5;

  static async getAll(userId: string) {
    return prisma.dailyTimeLog.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    });
  }

  static async upsert(
    userId: string,
    payload: {
      date: string;
      dsaHours: number;
      devAiHours: number;
      dsaWorkLog?: string;
      devAiWorkLog?: string;
    }
  ) {
    // ADR-4 — a bare YYYY-MM-DD is already a calendar date and must not be
    // shifted by anyone's offset; anything else is keyed in the user's zone.
    // V1's `new Date(payload.date)` + `setHours(0,0,0,0)` moved date-only
    // payloads a day backwards in every zone ahead of UTC. Throws on garbage.
    const parsedDate = parseUserDate(payload.date);
    const dsaWorkLog = payload.dsaWorkLog?.trim() || null;
    const devAiWorkLog = payload.devAiWorkLog?.trim() || null;

    if (payload.dsaHours < 0 || payload.devAiHours < 0) {
      throw new Error('Hours cannot be negative');
    }

    if (dsaWorkLog && dsaWorkLog.length > 300) {
      throw new Error('DSA work log must be 300 characters or less');
    }

    if (devAiWorkLog && devAiWorkLog.length > 300) {
      throw new Error('Dev + AI work log must be 300 characters or less');
    }

    const existingLog = await prisma.dailyTimeLog.findUnique({
      where: {
        userId_date: {
          userId,
          date: parsedDate
        }
      }
    });

    const savedLog = await prisma.dailyTimeLog.upsert({
      where: {
        userId_date: {
          userId,
          date: parsedDate
        }
      },
      update: {
        dsaHours: payload.dsaHours,
        devAiHours: payload.devAiHours,
        dsaWorkLog,
        devAiWorkLog
      },
      create: {
        userId,
        date: parsedDate,
        dsaHours: payload.dsaHours,
        devAiHours: payload.devAiHours,
        dsaWorkLog,
        devAiWorkLog
      }
    });

    const qualifiesNow = payload.dsaHours > 0 && payload.devAiHours > 0;
    const qualifiedBefore = !!existingLog && existingLog.dsaHours > 0 && existingLog.devAiHours > 0;

    if (qualifiesNow && !qualifiedBefore) {
      await this.updateUserStreak(userId, parsedDate);
    }

    return savedLog;
  }

  private static async updateUserStreak(userId: string, qualifiedDate: Date) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        streak: true,
        lastActive: true,
        streakFreezeDays: true,
        streakAwardedWeeks: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    let nextStreak = user.streak;
    let nextFreezeDays = user.streakFreezeDays;
    let nextAwardedWeeks = user.streakAwardedWeeks;

    if (user.streak === 0) {
      nextStreak = 1;
    } else {
      // ADR-4 — compare calendar days, not elapsed milliseconds. `lastActive`
      // is written below as a date key, so re-keying it in UTC is idempotent.
      const lastActiveDate = userDateKey(user.lastActive, 'UTC');
      const dayDiff = differenceInDateKeys(qualifiedDate, lastActiveDate);

      if (dayDiff <= 0) {
        return;
      }

      if (dayDiff === 1) {
        nextStreak += 1;
      } else {
        const missedDays = dayDiff - 1;

        if (nextFreezeDays >= missedDays) {
          nextFreezeDays -= missedDays;
          nextStreak += 1;
        } else {
          nextStreak = 1;
          nextFreezeDays = 0;
          nextAwardedWeeks = 0;
        }
      }
    }

    const earnedWeeks = Math.floor(nextStreak / 7);
    if (earnedWeeks > nextAwardedWeeks) {
      const grantableDays = Math.min(
        earnedWeeks - nextAwardedWeeks,
        DailyTimeLogService.MAX_FREEZE_DAYS - nextFreezeDays
      );

      if (grantableDays > 0) {
        nextFreezeDays += grantableDays;
      }

      nextAwardedWeeks = earnedWeeks;
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        streak: nextStreak,
        lastActive: qualifiedDate,
        streakFreezeDays: nextFreezeDays,
        streakAwardedWeeks: nextAwardedWeeks
      }
    });
  }
}
