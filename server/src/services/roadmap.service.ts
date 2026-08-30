import { prisma } from '../lib/prisma';

export class RoadmapService {
  static async getAllPhases() {
    return prisma.roadmapPhase.findMany({
      orderBy: { order: 'asc' },
      include: {
        items: {
          orderBy: { order: 'asc' }
        }
      }
    });
  }

  static async getUserProgress(userId: string) {
    return prisma.userProgress.findMany({
      where: { userId }
    });
  }

  static async toggleItemProgress(userId: string, itemId: string, completed: boolean) {
    return prisma.userProgress.upsert({
      where: { userId_itemId: { userId, itemId } },
      update: { completed, completedAt: completed ? new Date() : null },
      create: { userId, itemId, completed, completedAt: completed ? new Date() : null }
    });
  }
}
