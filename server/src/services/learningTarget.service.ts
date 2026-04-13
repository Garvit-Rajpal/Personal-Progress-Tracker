import { prisma } from '../index';

const defaultTargets = {
  dailyDsaTarget: '1 hour',
  dailyWebDevAiTarget: '2-3 hours',
  weekendProjectBuildTarget: '10-12 hours effort'
};

export class LearningTargetService {
  static async get(userId: string) {
    const existing = await prisma.learningTarget.findUnique({
      where: { userId }
    });

    if (existing) {
      return existing;
    }

    return prisma.learningTarget.create({
      data: {
        userId,
        ...defaultTargets
      }
    });
  }

  static async update(
    userId: string,
    payload: {
      dailyDsaTarget: string;
      dailyWebDevAiTarget: string;
      weekendProjectBuildTarget: string;
    }
  ) {
    const dailyDsaTarget = payload.dailyDsaTarget?.trim();
    const dailyWebDevAiTarget = payload.dailyWebDevAiTarget?.trim();
    const weekendProjectBuildTarget = payload.weekendProjectBuildTarget?.trim();

    if (!dailyDsaTarget || !dailyWebDevAiTarget || !weekendProjectBuildTarget) {
      throw new Error('All learning target fields are required');
    }

    return prisma.learningTarget.upsert({
      where: { userId },
      update: {
        dailyDsaTarget,
        dailyWebDevAiTarget,
        weekendProjectBuildTarget
      },
      create: {
        userId,
        dailyDsaTarget,
        dailyWebDevAiTarget,
        weekendProjectBuildTarget
      }
    });
  }
}
