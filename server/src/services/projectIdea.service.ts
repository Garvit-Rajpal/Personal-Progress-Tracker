import { prisma } from '../index';

export class ProjectIdeaService {
  static async getAll(userId: string) {
    return prisma.projectIdea.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' }
    });
  }

  static async create(
    userId: string,
    payload: {
      ideaName: string;
      description: string;
      priority: string;
      researchReferences: string;
      expectedTimeToBuild: string;
      startDate: string;
      dueDate: string;
    }
  ) {
    const ideaName = payload.ideaName?.trim();
    const description = payload.description?.trim();
    const priority = payload.priority?.trim();
    const researchReferences = payload.researchReferences?.trim();
    const expectedTimeToBuild = payload.expectedTimeToBuild?.trim();

    if (
      !ideaName ||
      !description ||
      !priority ||
      !researchReferences ||
      !expectedTimeToBuild ||
      !payload.startDate ||
      !payload.dueDate
    ) {
      throw new Error(
        'ideaName, description, priority, researchReferences, expectedTimeToBuild, startDate, and dueDate are required'
      );
    }

    const parsedStartDate = new Date(payload.startDate);
    const parsedDueDate = new Date(payload.dueDate);
    const normalizedPriority = priority.toLowerCase();

    if (!['low', 'medium', 'high'].includes(normalizedPriority)) {
      throw new Error('priority must be one of: low, medium, high');
    }

    const priorityLabel =
      normalizedPriority === 'low'
        ? 'Low'
        : normalizedPriority === 'medium'
          ? 'Medium'
          : 'High';

    if (Number.isNaN(parsedStartDate.getTime()) || Number.isNaN(parsedDueDate.getTime())) {
      throw new Error('Invalid startDate or dueDate');
    }

    return prisma.projectIdea.create({
      data: {
        userId,
        ideaName,
        description,
        priority: priorityLabel,
        researchReferences,
        expectedTimeToBuild,
        startDate: parsedStartDate,
        dueDate: parsedDueDate
      }
    });
  }
}
