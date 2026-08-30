import { prisma } from '../lib/prisma';

export class NextDayPlanService {
  static async get(userId: string) {
    return prisma.nextDayPlan.findUnique({
      where: { userId }
    });
  }

  static async upsert(userId: string, briefPlan: string) {
    const trimmedPlan = briefPlan?.trim();

    if (!trimmedPlan) {
      throw new Error('briefPlan is required');
    }

    return prisma.nextDayPlan.upsert({
      where: { userId },
      update: { briefPlan: trimmedPlan },
      create: { userId, briefPlan: trimmedPlan }
    });
  }
}
