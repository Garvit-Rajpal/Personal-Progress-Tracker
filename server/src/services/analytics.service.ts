import { prisma } from '../index';

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

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 6);

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

    const logMap = new Map(
      weeklyLogs.map((log) => [
        log.date.toISOString().slice(0, 10),
        { dsaHours: log.dsaHours, devAiHours: log.devAiHours }
      ])
    );

    const weekTrend = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      const key = date.toISOString().slice(0, 10);
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
