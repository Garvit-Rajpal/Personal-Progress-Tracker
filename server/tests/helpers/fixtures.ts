/**
 * Minimal row builders for service tests. Deliberately small — a fixture that
 * grows its own DSL becomes a second thing to debug.
 */
import { Difficulty } from '@prisma/client';
import { prisma } from '../../src/lib/prisma';

let seq = 0;

export async function createUser(overrides: Partial<{ email: string; name: string }> = {}) {
  seq += 1;
  return prisma.user.create({
    data: {
      email: overrides.email ?? `user${seq}-${Date.now()}@example.com`,
      name: overrides.name ?? `User ${seq}`,
      passwordHash: 'not-a-real-hash'
    }
  });
}

/**
 * Seed catalogue questions. Titles/topics match `191_striver_questions.json`
 * entries so `dsa.service`'s canonical ordering has something to sort by; a
 * question it cannot find there sorts last, which would make ordering
 * assertions meaningless.
 */
export async function seedDsaQuestions(count = 5) {
  const known = [
    { topic: 'Arrays', title: 'Set Matrix Zeroes' },
    { topic: 'Arrays', title: "Pascal's Triangle" },
    { topic: 'Arrays', title: 'Next Permutation' },
    { topic: 'Arrays', title: 'Kadane’s Algorithm' },
    { topic: 'Arrays', title: 'Sort an array of 0’s 1’s 2’s' },
    { topic: 'Arrays', title: 'Stock buy and Sell' },
    { topic: 'Arrays Part-II', title: 'Rotate Matrix' }
  ].slice(0, count);

  return prisma.$transaction(
    known.map((q, i) =>
      prisma.dSAQuestion.create({
        data: {
          title: q.title,
          topic: q.topic,
          difficulty: Difficulty.EASY,
          link: `https://example.test/q${i}`
        }
      })
    )
  );
}

export async function seedRoadmap() {
  const phase = await prisma.roadmapPhase.create({
    data: {
      title: `Phase ${(seq += 1)}`,
      type: 'AI',
      duration: '2 weeks',
      order: seq,
      resources: [],
      items: {
        create: [
          { title: 'Item A', description: 'first', badge: 'CORE', order: 1 },
          { title: 'Item B', description: 'second', badge: 'AI', order: 2 }
        ]
      }
    },
    include: { items: { orderBy: { order: 'asc' } } }
  });

  return phase;
}
