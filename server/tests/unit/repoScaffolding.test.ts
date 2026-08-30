/**
 * M0-5 — the docs scaffolding and the backup script exist and stay wired up.
 *
 * `CLAUDE.md` §Documentation makes documentation part of the Definition of
 * Done (ADR-11). A rule that is only enforced by remembering it is a rule that
 * decays, so the mechanical half of it is checked here: the files exist, the
 * ADR log has the entries the code references, and the backup script has not
 * quietly lost the guards that make its output trustworthy.
 */
import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

const REPO = path.resolve(__dirname, '..', '..', '..');
const read = (relative: string) => fs.readFileSync(path.join(REPO, relative), 'utf-8');
const exists = (relative: string) => fs.existsSync(path.join(REPO, relative));

describe('docs scaffolding', () => {
  it.each([
    'docs/PROGRESS.md',
    'docs/DECISIONS.md',
    'docs/HLD_v2.md',
    'docs/LLD_v2.md',
    'docs/cadence.md',
    'docs/features',
    'docs/reviews'
  ])('%s exists', (relative) => {
    expect(exists(relative)).toBe(true);
  });

  it('has a feature doc for the M0 foundation work (CLAUDE.md rule 3)', () => {
    expect(exists('docs/features/foundation.md')).toBe(true);
  });

  it('has a weekly review template to generate against', () => {
    expect(exists('docs/reviews/TEMPLATE.md')).toBe(true);
  });
});

describe('the ADR log records the decisions the code cites', () => {
  const decisions = () => read('docs/DECISIONS.md');

  // A heading, not a passing mention — DECISIONS.md already contains the
  // sentence "New decisions start at ADR-13", which a substring check would
  // happily accept as the ADR itself.
  it.each(['ADR-13', 'ADR-14'])('%s has its own section, not just a mention', (adr) => {
    expect(decisions()).toMatch(new RegExp(`^### ${adr} — .+$`, 'm'));
  });

  it.each(['ADR-13', 'ADR-14'])('%s records what it costs, not just what was chosen', (adr) => {
    const section = decisions().split(new RegExp(`^### ${adr} — `, 'm'))[1] ?? '';
    const body = section.split(/^### /m)[0];
    expect(body).toContain('**Alternatives rejected.**');
    expect(body).toContain('**Consequences.**');
  });

  it('every ADR number referenced from src/ exists in the log', () => {
    const src = path.join(REPO, 'server', 'src');
    const files = (function walk(dir: string): string[] {
      return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) return walk(full);
        return full.endsWith('.ts') ? [full] : [];
      });
    })(src);

    const referenced = new Set<string>();
    for (const file of files) {
      for (const match of fs.readFileSync(file, 'utf-8').matchAll(/\bADR-(\d+)\b/g)) {
        referenced.add(`ADR-${match[1]}`);
      }
    }

    const log = decisions() + read('docs/HLD_v2.md');
    const missing = [...referenced].filter((adr) => !log.includes(adr));
    expect(missing).toEqual([]);
  });
});

describe('scripts/backup.sh', () => {
  const script = () => read('scripts/backup.sh');

  it('exists and is executable', () => {
    const stat = fs.statSync(path.join(REPO, 'scripts', 'backup.sh'));
    expect(stat.mode & 0o111).toBeGreaterThan(0);
  });

  it('fails fast rather than continuing past an error', () => {
    expect(script()).toContain('set -euo pipefail');
  });

  it('uses pg_dump', () => {
    expect(script()).toContain('pg_dump');
  });

  it('can verify a dump by restoring it', () => {
    expect(script()).toContain('--verify');
  });

  it('requires typed confirmation before a restore overwrites data', () => {
    expect(script()).toMatch(/read -r -p/);
  });

  it('rejects a dump that did not complete', () => {
    expect(script()).toMatch(/did not complete/);
  });
});

describe('dumps are never committed', () => {
  it('backups/ is gitignored — these files contain real personal data', () => {
    expect(read('.gitignore')).toMatch(/^\/backups\/$/m);
  });
});

describe('.env.example stays current (CLAUDE.md §Environment)', () => {
  const example = () => read('server/.env.example');

  it.each([
    'DATABASE_URL',
    'DATABASE_URL_TEST',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'PORT',
    'CLIENT_URL',
    'USER_TIMEZONE'
  ])('documents %s', (key) => {
    expect(example()).toContain(key);
  });

  it('is committed while .env is not', () => {
    expect(exists('server/.env.example')).toBe(true);
    expect(read('server/.gitignore')).toMatch(/^\.env$/m);
  });
});
