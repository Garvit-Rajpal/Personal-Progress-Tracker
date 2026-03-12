import { prisma } from '../index';

export class AnalyticsService {
  static async getOverview(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { streak: true, lastActive: true, createdAt: true }
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

    return {
      user: {
        streak: user?.streak || 0,
        lastActive: user?.lastActive
      },
      roadmapProgress: {
        completed: roadmapProgressCount,
        total: totalRoadmapItems,
        percentage: totalRoadmapItems > 0 ? (roadmapProgressCount / totalRoadmapItems) * 100 : 0
      },
      dsaCompleted: dsaSolvedCount,
      categoryStats: categoryProgressText
    };
  }
}
