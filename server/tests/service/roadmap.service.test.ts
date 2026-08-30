/**
 * M0-6 — service tests for the existing roadmap service.
 *
 * The load-bearing test here is the last one: `UserProgress` is the only
 * completion history this app has, and MB-2 makes the curriculum seed run on
 * every boot (ADR-12). Losing progress to a re-seed would be the worst bug in
 * this repo, so the shape that seed must not disturb is pinned now.
 */
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { RoadmapService } from '../../src/services/roadmap.service';
import { prisma, resetAll, disconnect } from '../helpers/db';
import { createUser, seedRoadmap } from '../helpers/fixtures';

beforeEach(async () => {
  await resetAll();
});

afterAll(async () => {
  await disconnect();
});

describe('RoadmapService.getAllPhases', () => {
  it('returns phases with their items', async () => {
    await seedRoadmap();
    const phases = await RoadmapService.getAllPhases();

    expect(phases).toHaveLength(1);
    expect(phases[0].items).toHaveLength(2);
  });

  it('orders phases by `order`, not insertion', async () => {
    await prisma.roadmapPhase.create({
      data: { title: 'Second', type: 'AI', duration: '1w', order: 2, resources: [] }
    });
    await prisma.roadmapPhase.create({
      data: { title: 'First', type: 'FS', duration: '1w', order: 1, resources: [] }
    });

    const phases = await RoadmapService.getAllPhases();
    expect(phases.map((p) => p.title)).toEqual(['First', 'Second']);
  });

  it('orders items within a phase by `order`', async () => {
    await prisma.roadmapPhase.create({
      data: {
        title: 'Ordered',
        type: 'BOTH',
        duration: '1w',
        order: 1,
        resources: [],
        items: {
          create: [
            { title: 'Third', description: 'c', badge: 'CORE', order: 3 },
            { title: 'First', description: 'a', badge: 'CORE', order: 1 },
            { title: 'Second', description: 'b', badge: 'AI', order: 2 }
          ]
        }
      }
    });

    const [phase] = await RoadmapService.getAllPhases();
    expect(phase.items.map((i) => i.title)).toEqual(['First', 'Second', 'Third']);
  });

  it('is a shared catalogue, not user-scoped (ADR-9’s single exception)', async () => {
    await seedRoadmap();
    // Deliberately takes no userId — RoadmapPhase/RoadmapItem are the catalogue.
    expect(RoadmapService.getAllPhases.length).toBe(0);
  });

  it('returns an empty list rather than throwing when nothing is seeded', async () => {
    expect(await RoadmapService.getAllPhases()).toEqual([]);
  });
});

describe('RoadmapService.toggleItemProgress', () => {
  it('creates a progress row and stamps completedAt on completion', async () => {
    const phase = await seedRoadmap();
    const user = await createUser();

    const progress = await RoadmapService.toggleItemProgress(user.id, phase.items[0].id, true);

    expect(progress.completed).toBe(true);
    expect(progress.completedAt).toBeInstanceOf(Date);
  });

  it('clears completedAt when an item is un-completed', async () => {
    const phase = await seedRoadmap();
    const user = await createUser();

    await RoadmapService.toggleItemProgress(user.id, phase.items[0].id, true);
    const progress = await RoadmapService.toggleItemProgress(user.id, phase.items[0].id, false);

    expect(progress.completed).toBe(false);
    expect(progress.completedAt).toBeNull();
  });

  it('upserts rather than creating a duplicate row', async () => {
    const phase = await seedRoadmap();
    const user = await createUser();

    await RoadmapService.toggleItemProgress(user.id, phase.items[0].id, true);
    await RoadmapService.toggleItemProgress(user.id, phase.items[0].id, true);

    expect(await prisma.userProgress.count({ where: { userId: user.id } })).toBe(1);
  });

  it('tracks two items independently', async () => {
    const phase = await seedRoadmap();
    const user = await createUser();

    await RoadmapService.toggleItemProgress(user.id, phase.items[0].id, true);
    await RoadmapService.toggleItemProgress(user.id, phase.items[1].id, false);

    const rows = await RoadmapService.getUserProgress(user.id);
    expect(rows.filter((r) => r.completed)).toHaveLength(1);
  });
});

describe('RoadmapService.getUserProgress', () => {
  it("returns only the calling user's rows (invariant 1)", async () => {
    const phase = await seedRoadmap();
    const mine = await createUser();
    const theirs = await createUser();

    await RoadmapService.toggleItemProgress(theirs.id, phase.items[0].id, true);

    expect(await RoadmapService.getUserProgress(mine.id)).toEqual([]);
    expect(await RoadmapService.getUserProgress(theirs.id)).toHaveLength(1);
  });

  it('is empty for a user who has done nothing', async () => {
    await seedRoadmap();
    const user = await createUser();

    expect(await RoadmapService.getUserProgress(user.id)).toEqual([]);
  });
});

describe('UserProgress survives catalogue churn — the MB-2 contract', () => {
  it('keeps completion when a phase is re-upserted by title', async () => {
    const phase = await seedRoadmap();
    const user = await createUser();
    await RoadmapService.toggleItemProgress(user.id, phase.items[0].id, true);

    // What an idempotent re-seed does (LLD_v2 §6): upsert the phase on title
    // and each item on (phaseId, title). Nothing is deleted.
    await prisma.roadmapPhase.update({
      where: { id: phase.id },
      data: { duration: '3 weeks', order: 99 }
    });
    await prisma.roadmapItem.update({
      where: { id: phase.items[0].id },
      data: { description: 'reworded by the curriculum edit' }
    });

    const progress = await RoadmapService.getUserProgress(user.id);
    expect(progress).toHaveLength(1);
    expect(progress[0].completed).toBe(true);
  });

  it('cascades progress away only when the item itself is deleted', async () => {
    // The failure mode MB-2 must avoid: a seed that clears and recreates items
    // takes UserProgress with it, because the FK cascades. `prisma/seed.js`
    // does exactly this today ("Clearing existing roadmap data...").
    const phase = await seedRoadmap();
    const user = await createUser();
    await RoadmapService.toggleItemProgress(user.id, phase.items[0].id, true);

    await prisma.roadmapItem.delete({ where: { id: phase.items[0].id } });

    expect(await RoadmapService.getUserProgress(user.id)).toEqual([]);
  });
});
