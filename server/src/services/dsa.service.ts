import { prisma } from '../lib/prisma';
import { userDateKey } from '../utils/time';
import fs from 'fs';
import path from 'path';

const canonicalSheetLink = 'https://takeuforward.org/dsa/strivers-sde-sheet-top-coding-interview-problems';

function normalizeSheetText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

const canonicalOrder = (() => {
  try {
    const filePath = path.join(process.cwd(), '191_striver_questions.json');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const questions = JSON.parse(rawData) as Array<{ topic: string; title: string; link: string | null }>;

    return questions.map((question, index) => ({
      key: normalizeSheetText(`${question.topic}::${question.title}`),
      index
    }));
  } catch {
    return [] as Array<{ key: string; index: number }>;
  }
})();

function getQuestionOrder(question: { topic: string; title: string }) {
  const key = normalizeSheetText(`${question.topic}::${question.title}`);
  const exactMatch = canonicalOrder.find((item) => item.key === key);
  return exactMatch?.index ?? Number.MAX_SAFE_INTEGER;
}

export class DSAService {
  static async getAllQuestions(userId: string) {
    const questions = await prisma.dSAQuestion.findMany({
      orderBy: { id: 'asc' }
    });

    const sortedQuestions = [...questions].sort((a, b) => {
      const aOrder = getQuestionOrder(a);
      const bOrder = getQuestionOrder(b);

      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.title.localeCompare(b.title);
    });

    const progress = await prisma.userDSAProgress.findMany({
      where: { userId }
    });

    return { questions: sortedQuestions, progress, canonicalSheetLink };
  }

  static async getTodaySet(userId: string) {
    // ADR-4 — the key for *the user's* calendar day. V1 used server-local
    // midnight, which is UTC in the container, so between 00:00 and 05:30 IST
    // this resolved to yesterday and handed back yesterday's set.
    const today = userDateKey();

    let dailySet = await prisma.dailyDSASet.findUnique({
      where: { date: today },
      include: { questions: true }
    });

    if (!dailySet) {
      const questions = await prisma.dSAQuestion.findMany();
      const sortedQuestions = [...questions].sort((a, b) => {
        const aOrder = getQuestionOrder(a);
        const bOrder = getQuestionOrder(b);

        if (aOrder !== bOrder) return aOrder - bOrder;
        return a.title.localeCompare(b.title);
      });
      
      if (sortedQuestions.length === 0) {
        return { message: "No questions in DB" };
      }

      const selectedQuestions = sortedQuestions.slice(0, 3);

      dailySet = await prisma.dailyDSASet.create({
        data: {
          date: today,
          questions: {
            connect: selectedQuestions.map(q => ({ id: q.id }))
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
