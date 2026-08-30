import { prisma } from '../lib/prisma';

const defaultRoadmapLinks = [
  {
    title: 'Striver SDE Sheet',
    url: 'https://takeuforward.org/dsa/strivers-sde-sheet-top-coding-interview-problems',
    notes: 'Canonical DSA sheet used by the app.',
    kind: 'DEFAULT' as const,
  },
  {
    title: 'AI Engineer Roadmap',
    url: '/roadmap',
    notes: 'The built-in roadmap you can track inside the app.',
    kind: 'DEFAULT' as const,
  },
];

export class RoadmapLinkService {
  static async ensureDefaultLinks(userId: string) {
    const existingCount = await prisma.userRoadmapLink.count({ where: { userId } });

    if (existingCount > 0) {
      return;
    }

    await prisma.userRoadmapLink.createMany({
      data: defaultRoadmapLinks.map((link) => ({
        userId,
        title: link.title,
        url: link.url,
        notes: link.notes,
        kind: link.kind,
      })),
    });
  }

  static async getAll(userId: string) {
    await this.ensureDefaultLinks(userId);

    return prisma.userRoadmapLink.findMany({
      where: { userId },
      orderBy: [{ kind: 'asc' }, { createdAt: 'asc' }],
    });
  }

  static async create(userId: string, title: string, url: string, notes?: string) {
    const trimmedTitle = title?.trim();
    const trimmedUrl = url?.trim();
    const trimmedNotes = notes?.trim();

    if (!trimmedTitle) {
      throw new Error('title is required');
    }

    if (!trimmedUrl) {
      throw new Error('url is required');
    }

    return prisma.userRoadmapLink.create({
      data: {
        userId,
        title: trimmedTitle,
        url: trimmedUrl,
        notes: trimmedNotes || null,
        kind: 'CUSTOM',
      },
    });
  }
}