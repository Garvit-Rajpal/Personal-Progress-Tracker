#!/usr/bin/env node
/**
 * Roadmap resource generator — ADR-17.
 *
 * Parses `docs/curriculum/notes/roadmap-resources.md` into
 * `src/lib/roadmapResources.generated.ts`.
 *
 * Why a generated module rather than a database column: the column is MB-1 and
 * the milestone order is strict (`CLAUDE.md`). This is the same trade already
 * made by `src/lib/cadence.ts`, which duplicates `docs/cadence.md` §6 in the
 * client until MA-12 ships the endpoint that should own it.
 *
 * Invariant 8 still holds — the markdown is the source of truth and this
 * module is a projection of it, exactly as the database will be at MB-4.
 *
 *   node scripts/build-roadmap-resources.mjs           # write
 *   node scripts/build-roadmap-resources.mjs --check   # fail if stale (CI)
 *
 * TODO(MB-4): delete this script and the generated module. Resources move to
 * `RoadmapItem.resources`, seeded by `seedCurriculum.js` from the same file,
 * and `ItemResources` reads them off the item instead of a static map.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const SOURCE = join(ROOT, '..', 'docs', 'curriculum', 'notes', 'roadmap-resources.md');
const OUT = join(ROOT, 'src', 'lib', 'roadmapResources.generated.ts');

const KINDS = new Set(['docs', 'video', 'drill', 'note']);

/** Strip fenced code blocks so the format example in the prose is not parsed. */
function stripFences(source) {
  return source.replace(/^```[\s\S]*?^```/gm, '');
}

function parse(source) {
  const blocks = stripFences(source).split(/^### /m).slice(1);
  const entries = [];
  const errors = [];

  for (const block of blocks) {
    const lines = block.split('\n');
    const key = lines[0].trim();

    if (!key.includes(' :: ')) {
      errors.push(`heading is not "Phase :: Item": ${key}`);
      continue;
    }

    let section = null;
    const revise = [];
    const links = [];

    for (const raw of lines.slice(1)) {
      const line = raw.trim();
      if (line === 'Revise:') { section = 'revise'; continue; }
      if (line === 'Links:') { section = 'links'; continue; }
      if (!line.startsWith('- ')) continue;

      const body = line.slice(2).trim();

      if (section === 'revise') {
        revise.push(body);
      } else if (section === 'links') {
        // - [kind Nm] Title — https://url
        const m = /^\[(\w+)(?:\s+(\d+)m)?\]\s*(.+?)\s+—\s+(\S+)$/.exec(body);
        if (!m) { errors.push(`${key}: unparseable link line: ${body}`); continue; }
        const [, kind, minutes, title, url] = m;
        if (!KINDS.has(kind)) { errors.push(`${key}: unknown kind "${kind}"`); continue; }
        if (kind === 'video' && !minutes) errors.push(`${key}: video has no duration: ${title}`);
        if (!/^https?:\/\//.test(url)) { errors.push(`${key}: not an absolute URL: ${url}`); continue; }
        links.push({ kind, title, url, ...(minutes ? { minutes: Number(minutes) } : {}) });
      }
    }

    if (revise.length === 0) errors.push(`${key}: no Revise bullets`);
    if (links.length === 0) errors.push(`${key}: no Links`);
    entries.push({ key, revise, links });
  }

  const seen = new Set();
  for (const { key } of entries) {
    if (seen.has(key)) errors.push(`duplicate key: ${key}`);
    seen.add(key);
  }

  return { entries, errors };
}

function render(entries) {
  const body = entries
    .map(({ key, revise, links }) => {
      const bullets = revise.map((b) => `      ${JSON.stringify(b)}`).join(',\n');
      const rows = links
        .map((l) => `      ${JSON.stringify(l)}`)
        .join(',\n');
      return `  ${JSON.stringify(key)}: {\n    revise: [\n${bullets}\n    ],\n    links: [\n${rows}\n    ]\n  }`;
    })
    .join(',\n');

  return `/**
 * GENERATED FILE — DO NOT EDIT.
 *
 * Source: docs/curriculum/notes/roadmap-resources.md
 * Regenerate: npm run build:resources
 *
 * ADR-17. Curriculum markdown is the source of truth (invariant 8); this is a
 * projection of it, the same way the database will be at MB-4.
 *
 * TODO(MB-4): delete. Resources move onto RoadmapItem.resources.
 */

export type ResourceKind = 'docs' | 'video' | 'drill' | 'note';

export interface RoadmapResourceLink {
  kind: ResourceKind;
  title: string;
  url: string;
  /** Runtime in whole minutes. Present for videos, read from the video itself. */
  minutes?: number;
}

export interface RoadmapItemResources {
  /** Short revision content, rendered inline. Content, not descriptions of content. */
  revise: string[];
  links: RoadmapResourceLink[];
}

/** Keyed \`Phase title :: Item title\` — the pair the MB-2 seed upserts on. */
export const ROADMAP_RESOURCES: Record<string, RoadmapItemResources> = {
${body}
};

export function resourcesFor(
  phaseTitle: string | undefined,
  itemTitle: string | undefined
): RoadmapItemResources | undefined {
  if (!phaseTitle || !itemTitle) return undefined;
  return ROADMAP_RESOURCES[\`\${phaseTitle} :: \${itemTitle}\`];
}
`;
}

const { entries, errors } = parse(readFileSync(SOURCE, 'utf-8'));

if (errors.length > 0) {
  console.error('roadmap-resources.md does not match the ADR-17 format:\n');
  for (const e of errors) console.error(`  ✖ ${e}`);
  process.exit(1);
}

const output = render(entries);
const check = process.argv.includes('--check');

if (check) {
  let current = '';
  try { current = readFileSync(OUT, 'utf-8'); } catch { /* missing counts as stale */ }
  if (current !== output) {
    console.error('✖ roadmapResources.generated.ts is stale. Run: npm run build:resources');
    process.exit(1);
  }
  const videos = entries.flatMap((e) => e.links.filter((l) => l.kind === 'video'));
  console.log(`✓ resources up to date — ${entries.length} items, ${videos.length} videos`);
} else {
  writeFileSync(OUT, output);
  const links = entries.reduce((n, e) => n + e.links.length, 0);
  const bullets = entries.reduce((n, e) => n + e.revise.length, 0);
  console.log(`✓ ${entries.length} items → ${bullets} revise bullets, ${links} links`);
}
