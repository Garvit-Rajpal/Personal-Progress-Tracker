import { prisma } from '../lib/prisma';
import { formatUserDate, weekRange } from '../utils/time';

export class AnalyticsService {
  static async getOverview(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { streak: true, streakFreezeDays: true, lastActive: true, createdAt: true }
    });

    const roadmapProgressCount = await prisma.userProgress.count({
      where: { userId, completed: true }
    });

    const totalRoadmapItems = await prisma.roadmapItem.count();
    
    const userProgress = await prisma.userProgress.findMany({
      where: { userId, completed: true },
      include: {
        item: {
          include: {
            phase: {
              select: { type: true }
            }
          }
        }
      }
    });

    const categoryCounts: Record<string, number> = {};
    for (const p of userProgress) {
      if (p.item?.phase?.type) {
        const t = p.item.phase.type;
        categoryCounts[t] = (categoryCounts[t] || 0) + 1;
      }
    }

    const categoryProgressText = Object.entries(categoryCounts).map(([type, count]) => ({
      type,
      count: Number(count)
    }));

    const dsaSolvedCount = await prisma.userDSAProgress.count({
      where: { userId, solved: true }
    });

    // ADR-4 — the rolling seven-day window ends on the *user's* today. V1
    // derived both ends from server-local midnight and stepped days with
    // setDate, so the whole dashboard trend slid by a day for 5h30m daily.
    const { start: weekStart, end: today, days: weekDays } = weekRange();

    const todayTimeLog = await prisma.dailyTimeLog.findUnique({
      where: {
        userId_date: {
          userId,
          date: today
        }
      }
    });

    const weeklyLogs = await prisma.dailyTimeLog.findMany({
      where: {
        userId,
        date: {
          gte: weekStart,
          lte: today
        }
      },
      orderBy: { date: 'asc' }
    });

    const weeklyDsaHours = weeklyLogs.reduce((sum, log) => sum + log.dsaHours, 0);
    const weeklyDevAiHours = weeklyLogs.reduce((sum, log) => sum + log.devAiHours, 0);

    // `@db.Date` values come back as UTC midnight, so 'UTC' here reads the
    // stored calendar date rather than re-interpreting it in another zone.
    const logMap = new Map(
      weeklyLogs.map((log) => [
        formatUserDate(log.date, 'UTC'),
        { dsaHours: log.dsaHours, devAiHours: log.devAiHours }
      ])
    );

    const weekTrend = weekDays.map((date) => {
      const key = formatUserDate(date, 'UTC');
      const dayLog = logMap.get(key);

      return {
        date: key,
        dsaHours: dayLog?.dsaHours || 0,
        devAiHours: dayLog?.devAiHours || 0,
        totalHours: (dayLog?.dsaHours || 0) + (dayLog?.devAiHours || 0)
      };
    });

    return {
      user: {
        streak: user?.streak || 0,
        streakFreezeDays: user?.streakFreezeDays || 0,
        lastActive: user?.lastActive
      },
      roadmapProgress: {
        completed: roadmapProgressCount,
        total: totalRoadmapItems,
        percentage: totalRoadmapItems > 0 ? (roadmapProgressCount / totalRoadmapItems) * 100 : 0
      },
      dsaCompleted: dsaSolvedCount,
      categoryStats: categoryProgressText,
      timeTracking: {
        today: {
          dsaHours: todayTimeLog?.dsaHours || 0,
          devAiHours: todayTimeLog?.devAiHours || 0
        },
        week: {
          dsaHours: weeklyDsaHours,
          devAiHours: weeklyDevAiHours
        },
        weekTrend
      }
    };
  }
}
