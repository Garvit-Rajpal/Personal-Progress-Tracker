import { prisma } from '../index';

const defaultFinancialGoal = {
  goals: 'Build 6 months emergency fund\nIncrease monthly savings by 10%',
  learningNotes: 'Track spending weekly\nStudy index funds and taxation basics'
};

export class FinancialGoalService {
  static async get(userId: string) {
    const existing = await prisma.financialGoal.findUnique({
      where: { userId }
    });

    if (existing) {
      return existing;
    }

    return prisma.financialGoal.create({
      data: {
        userId,
        ...defaultFinancialGoal
      }
    });
  }

  static async update(userId: string, payload: { goals: string; learningNotes: string }) {
    const goals = payload.goals?.trim();
    const learningNotes = payload.learningNotes?.trim();

    if (!goals || !learningNotes) {
      throw new Error('Financial goals and notes are required');
    }

    return prisma.financialGoal.upsert({
      where: { userId },
      update: {
        goals,
        learningNotes
      },
      create: {
        userId,
        goals,
        learningNotes
      }
    });
  }
}
