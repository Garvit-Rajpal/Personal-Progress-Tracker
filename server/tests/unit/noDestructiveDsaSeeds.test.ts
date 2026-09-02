/**
 * ADR-15 - no DSA seeder may delete catalogue rows again.
 *
 * `UserDSAProgress.questionId` cascades on delete, so any `deleteMany()` on
 * `DSAQuestion` destroys the user's solved history as a side effect. Both of
 * this repo's DSA seeders did exactly that, and it cost a real 191-question
 * sheet and its progress.
 *
 * The rule is a property of the repo, not of any one module, so it is checked
 * by reading the repo. `CLAUDE.md` invariant 7 ("seed scripts are idempotent")
 * has been true on paper since before the data was lost; this is the version
 * that fails a build.
 */
import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

const SERVER = path.resolve(__dirname, '..', '..');

/** Every seed-ish file: the CLI scripts plus anything under src/services. */
function seedFiles(): string[] {
  const roots = [
    path.join(SERVER, 'prisma'),
    path.join(SERVER, 'src', 'services'),
    SERVER
  ];

  const found = new Set<string>();
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      if (!/\.(ts|js)$/.test(entry.name)) continue;
      if (!/seed/i.test(entry.name)) continue;
      found.add(path.join(root, entry.name));
    }
  }
  return [...found];
}

const DESTRUCTIVE = /\b(dSAQuestion|userDSAProgress|dailyDSASet)\s*\.\s*deleteMany\s*\(/;

describe('DSA seeders never delete', () => {
  it('finds the seed files it is meant to be guarding', () => {
    const names = seedFiles().map((f) => path.basename(f));
    expect(names).toContain('seed-191.js');
    expect(names).toContain('dsaSeed.service.ts');
  });

  it.each(seedFiles().map((f) => [path.relative(SERVER, f), f]))(
    '%s does not call deleteMany on the DSA tables',
    (_label, file) => {
      const source = fs.readFileSync(file, 'utf-8');
      // Strip block and line comments: these files legitimately quote the old
      // destructive code to explain why it is gone.
      const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
      expect(code).not.toMatch(DESTRUCTIVE);
    }
  );

  it('the 18-question sample seeder is gone for good', () => {
    expect(fs.existsSync(path.join(SERVER, 'prisma', 'seed-dsa.js'))).toBe(false);
  });

  it('nothing still shells out to it', () => {
    const bootstrap = fs.readFileSync(
      path.join(SERVER, 'src', 'services', 'bootstrap.service.ts'),
      'utf-8'
    );
    const code = bootstrap.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    expect(code).not.toContain('seed-dsa');
  });
});

describe('no seeder fabricates solved history', () => {
  it.each(seedFiles().map((f) => [path.relative(SERVER, f), f]))(
    '%s does not write UserDSAProgress',
    (_label, file) => {
      const source = fs.readFileSync(file, 'utf-8');
      const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
      // The old seed-191.js wrote 140 `solved: true` rows chosen by
      // `slice(0, 140)` and showed them to the user as their own progress.
      expect(code).not.toMatch(/userDSAProgress\s*\.\s*(create|createMany|upsert|updateMany)\s*\(/);
    }
  );
});

describe('the catalogue has the natural key the seed upserts on', () => {
  it('DSAQuestion is unique on (topic, title)', () => {
    const schema = fs.readFileSync(path.join(SERVER, 'prisma', 'schema.prisma'), 'utf-8');
    const model = schema.split(/^model DSAQuestion \{$/m)[1].split(/^\}/m)[0];
    expect(model).toMatch(/@@unique\(\[topic,\s*title\]\)/);
  });

  it('a migration creates that index', () => {
    const dir = path.join(SERVER, 'prisma', 'migrations');
    const sql = fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => path.join(dir, e.name, 'migration.sql'))
      .filter((f) => fs.existsSync(f))
      .map((f) => fs.readFileSync(f, 'utf-8'))
      .join('\n');

    expect(sql).toMatch(/CREATE UNIQUE INDEX "DSAQuestion_topic_title_key"/);
  });
});
