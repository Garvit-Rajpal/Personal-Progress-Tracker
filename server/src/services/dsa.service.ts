import { prisma } from '../index';

export class DSAService {
  static async getAllQuestions(userId: string) {
    const questions = await prisma.dSAQuestion.findMany({
      orderBy: { id: 'asc' } // or whatever order
    });

    const progress = await prisma.userDSAProgress.findMany({
      where: { userId }
    });

    return { questions, progress };
  }

  static async getTodaySet(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let dailySet = await prisma.dailyDSASet.findUnique({
      where: { date: today },
      include: { questions: true }
    });

    if (!dailySet) {
      const questions = await prisma.dSAQuestion.findMany({ take: 3 });
      
      if (questions.length === 0) {
        return { message: "No questions in DB" };
      }

      dailySet = await prisma.dailyDSASet.create({
        data: {
          date: today,
          questions: {
            connect: questions.map(q => ({ id: q.id }))
          }
        },
        include: { questions: true }
      });
    }

    const questionIds = dailySet.questions.map(q => q.id);
    const progress = await prisma.userDSAProgress.findMany({
      where: { userId, questionId: { in: questionIds } }
    });

    return { set: dailySet, progress };
  }

  static async toggleSolved(userId: string, questionId: string, solved: boolean) {
    return prisma.userDSAProgress.upsert({
      where: { userId_questionId: { userId, questionId } },
      update: { solved, solvedAt: solved ? new Date() : null },
      create: { userId, questionId, solved, solvedAt: solved ? new Date() : null }
    });
  }

  static async updateNotes(userId: string, questionId: string, notes: string) {
    return prisma.userDSAProgress.upsert({
      where: { userId_questionId: { userId, questionId } },
      update: { notes },
      create: { userId, questionId, notes }
    });
  }
}
