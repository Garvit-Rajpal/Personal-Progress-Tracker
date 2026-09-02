/**
 * The curriculum markdown conforms to the seed contract in `docs/LLD_v2.md` §6.
 *
 * ADR-12 makes these files the source of truth and the database a projection of
 * them, which only works if the parser MB-2 builds can actually read them. The
 * format is a contract between a human editing markdown and a script that has
 * not been written yet, so it needs a test now rather than a surprise later.
 *
 * This asserts the *shape*, not the content - it is a linter for the contract,
 * not a review of the syllabus.
 */
import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

const CURRICULUM = path.resolve(__dirname, '..', '..', '..', 'docs', 'curriculum');
const FILES = fs.readdirSync(CURRICULUM).filter((f) => f.endsWith('.md'));

const PHASE_TYPES = ['DESIGN', 'AI', 'FS', 'BOTH'];
const BADGES = ['CORE', 'AI', 'PROJECT', 'JOB', 'DESIGN', 'THEORY'];

interface Phase {
  file: string;
  title: string;
  type: string;
  duration: string;
  resources: string;
  items: Array<{ title: string; badge: string; description: string }>;
}

/** A deliberately strict reading of the LLD §6 shape. */
function parse(file: string): Phase[] {
  const source = fs.readFileSync(path.join(CURRICULUM, file), 'utf-8');
  const blocks = source.split(/^### Phase: /m).slice(1);

  return blocks.map((block) => {
    const lines = block.split('\n');
    const title = lines[0].trim();

    const meta = (key: string) => {
      const line = lines.find((l) => l.startsWith(`${key}: `));
      return line ? line.slice(key.length + 2).trim() : '';
    };

    const items = [...block.matchAll(/^\|\s*(.+?)\s*\|\s*([A-Z]+)\s*\|\s*(.+?)\s*\|\s*$/gm)]
      .filter((m) => m[1] !== 'Item')
      .map((m) => ({ title: m[1], badge: m[2], description: m[3] }));

    return {
      file,
      title,
      type: meta('Type'),
      duration: meta('Duration'),
      resources: meta('Resources'),
      items
    };
  });
}

const ALL: Phase[] = FILES.flatMap(parse);

describe('curriculum files', () => {
  it('both tracks are present', () => {
    expect(FILES.sort()).toEqual(['ai-engineering.md', 'system-design.md']);
  });

  it('every file defines at least one phase', () => {
    for (const file of FILES) expect(parse(file).length).toBeGreaterThan(0);
  });
});

describe('phase headers', () => {
  it.each(ALL.map((p) => [`${p.file} :: ${p.title}`, p]))('%s has a non-empty title', (_l, p) => {
    expect(p.title.length).toBeGreaterThan(0);
  });

  it.each(ALL.map((p) => [`${p.file} :: ${p.title}`, p]))('%s declares a valid Type', (_l, p) => {
    expect(PHASE_TYPES).toContain(p.type);
  });

  it.each(ALL.map((p) => [`${p.file} :: ${p.title}`, p]))('%s declares a Duration', (_l, p) => {
    expect(p.duration.length).toBeGreaterThan(0);
  });

  it.each(ALL.map((p) => [`${p.file} :: ${p.title}`, p]))('%s declares Resources', (_l, p) => {
    expect(p.resources.length).toBeGreaterThan(0);
  });

  it.each(ALL.map((p) => [`${p.file} :: ${p.title}`, p]))('%s has at least one item', (_l, p) => {
    expect(p.items.length).toBeGreaterThan(0);
  });
});

describe('items', () => {
  const items = ALL.flatMap((p) => p.items.map((i) => ({ ...i, phase: p.title, file: p.file })));

  it('every badge is one the Prisma enum can hold', () => {
    const bad = items.filter((i) => !BADGES.includes(i.badge));
    expect(bad.map((i) => `${i.phase} :: ${i.title} :: ${i.badge}`)).toEqual([]);
  });

  it('every item has a description', () => {
    const bare = items.filter((i) => i.description.trim().length < 10);
    expect(bare.map((i) => `${i.phase} :: ${i.title}`)).toEqual([]);
  });

  it('item titles are unique within their phase — the seed upserts on (phase, title)', () => {
    const dupes: string[] = [];
    for (const phase of ALL) {
      const seen = new Set<string>();
      for (const item of phase.items) {
        if (seen.has(item.title)) dupes.push(`${phase.title} :: ${item.title}`);
        seen.add(item.title);
      }
    }
    expect(dupes).toEqual([]);
  });

  it('no description contains an unescaped pipe, which would break the table', () => {
    const broken = items.filter((i) => i.description.includes('|'));
    expect(broken.map((i) => `${i.phase} :: ${i.title}`)).toEqual([]);
  });
});

describe('phase titles do not collide with the V1 seed (MB-4)', () => {
  // `prisma/seed.js` owns these six. A curriculum phase sharing a title would
  // be upserted onto a V1 phase rather than created alongside it.
  const V1_PHASES = [
    'TypeScript & Modern Web Foundation',
    'LLM Fundamentals & API Layer',
    'RAG Systems & Vector Search',
    'AI Agents & LangGraph',
    'Full-Stack Frontend for AI Apps',
    'Production, Deployment & Job-Ready'
  ];

  it('no curriculum phase reuses a V1 phase title', () => {
    const collisions = ALL.filter((p) => V1_PHASES.includes(p.title));
    expect(collisions.map((p) => p.title)).toEqual([]);
  });

  it('phase titles are unique across both curriculum files', () => {
    const titles = ALL.map((p) => p.title);
    expect(titles).toHaveLength(new Set(titles).size);
  });
});

describe('the AI track matches what its own prose claims', () => {
  const ai = parse('ai-engineering.md');
  const prose = fs.readFileSync(path.join(CURRICULUM, 'ai-engineering.md'), 'utf-8');
  const itemCount = ai.reduce((n, p) => n + p.items.length, 0);

  it('the stated item count is the real item count', () => {
    // `docs/cadence.md` is explicit that a number in the docs disagreeing with
    // reality means the docs are wrong. This track's pace maths is load-bearing
    // for planning, so it gets checked rather than trusted.
    const claimed = /This track is \*\*(\d+) items\*\*/.exec(prose);
    expect(claimed).not.toBeNull();
    expect(Number(claimed![1])).toBe(itemCount);
  });

  it('covers context engineering — the 2026 revision', () => {
    expect(ai.map((p) => p.title)).toContain('Context Engineering');
  });

  it('covers MCP as more than a single line item', () => {
    const mcp = ai.find((p) => p.title.startsWith('Model Context Protocol'));
    expect(mcp?.items.length).toBeGreaterThanOrEqual(4);
  });
});
