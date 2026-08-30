/**
 * M0-3 acceptance: "No `setHours(0, 0, 0, 0)` remains in `src/`; grep asserted
 * in a test" (`docs/LLD_v2.md` §7).
 *
 * This is the guard that keeps ADR-4 true after M0 closes. The helper is only
 * worth having if nothing quietly goes back to computing a day boundary inline,
 * and that is a property of the tree, not of any one module — so it is checked
 * by reading the tree.
 */
import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

const SRC = path.resolve(__dirname, '..', '..', 'src');
const TIME_HELPER = path.join(SRC, 'utils', 'time.ts');

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return entry.isFile() && full.endsWith('.ts') ? [full] : [];
  });
}

function offenders(pattern: RegExp, { allowTimeHelper = false } = {}): string[] {
  return sourceFiles(SRC)
    .filter((file) => !(allowTimeHelper && file === TIME_HELPER))
    .flatMap((file) =>
      fs
        .readFileSync(file, 'utf-8')
        .split('\n')
        .map((line, i) => ({ line, n: i + 1 }))
        .filter(({ line }) => pattern.test(line))
        .map(({ n, line }) => `${path.relative(SRC, file)}:${n}: ${line.trim()}`)
    );
}

describe('src/ contains no inline day-boundary arithmetic', () => {
  it('has no setHours(0, 0, 0, 0)', () => {
    expect(offenders(/\.setHours\s*\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)/)).toEqual([]);
  });

  it('has no setHours at all — any of its forms is a server-timezone answer', () => {
    expect(offenders(/\.setHours\s*\(/)).toEqual([]);
  });

  it('has no setDate-based day stepping outside the time helper', () => {
    // `setDate` is how V1 walked back seven days for the dashboard trend. It is
    // server-local too, so it belongs behind weekRange().
    expect(offenders(/\.setDate\s*\(/, { allowTimeHelper: true })).toEqual([]);
  });

  it('has no getTimezoneOffset — the server offset is never the user offset', () => {
    expect(offenders(/getTimezoneOffset\s*\(/, { allowTimeHelper: true })).toEqual([]);
  });
});

describe('the services that resolve "today" use the helper', () => {
  it.each(['services/dsa.service.ts', 'services/dailyTimeLog.service.ts', 'services/analytics.service.ts'])(
    '%s imports from utils/time',
    (relative) => {
      const source = fs.readFileSync(path.join(SRC, relative), 'utf-8');
      expect(source).toMatch(/from '\.\.\/utils\/time'/);
    }
  );
});
