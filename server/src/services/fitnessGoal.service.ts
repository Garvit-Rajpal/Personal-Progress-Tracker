import { prisma } from '../lib/prisma';

const defaultFitnessGoal = {
  goals: '5 workouts per week\n10k steps daily\nStrength + mobility split'
};

export class FitnessGoalService {
  static async get(userId: string) {
    const existing = await prisma.fitnessGoal.findUnique({
      where: { userId }
    });

    if (existing) {
      return existing;
    }

    return prisma.fitnessGoal.create({
      data: {
        userId,
        ...defaultFitnessGoal
      }
    });
  }

  static async update(userId: string, payload: { goals: string }) {
    const goals = payload.goals?.trim();

    if (!goals) {
      throw new Error('Fitness goals are required');
    }

    return prisma.fitnessGoal.upsert({
      where: { userId },
      update: { goals },
      create: {
        userId,
        goals
      }
    });
  }
}
