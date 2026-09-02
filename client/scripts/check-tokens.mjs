#!/usr/bin/env node
/**
 * Token guard — ADR-16.
 *
 * Fails if a raw colour literal appears in `client/src/` outside globals.css.
 * This is what keeps the design system true after D0 closes, the same way
 * `server/tests/unit/noInlineDayBoundaries.test.ts` keeps ADR-4 true after M0.
 *
 * It is a lint check, not a test suite — it does not reopen the
 * "no client tests" decision in CLAUDE.md §Stack.
 *
 *   node scripts/check-tokens.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const SRC = join(ROOT, 'src');

/** globals.css is the one place a literal is allowed to exist. */
const ALLOWED = new Set(['src/app/globals.css']);

const RULES = [
  { name: 'tailwind grey literal', re: /\b(?:bg|text|border|ring|from|to|via|fill|stroke|shadow|divide|outline|decoration|placeholder|accent|caret)-(?:neutral|zinc|gray|slate|stone)-\d{2,3}\b/g },
  { name: 'tailwind colour literal', re: /\b(?:bg|text|border|ring|from|to|via|fill|stroke|divide|outline|decoration|placeholder|accent|caret)-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/g },
  { name: 'white/black alpha literal', re: /\b(?:bg|text|border|ring|from|to|via|fill|stroke|divide|shadow|outline)-(?:white|black)(?:\/\d{1,3})?\b/g },
  { name: 'hex colour', re: /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g },
  { name: 'rgb/hsl literal', re: /\b(?:rgba?|hsla?)\(\s*\d/g },
  { name: 'raw oklch', re: /\boklch\(/g },
  { name: 'injected <style> block', re: /<style\b[^>]*dangerouslySetInnerHTML/g }
];

/**
 * Strip comments and JSX text so a rule cannot fire on prose. Every one of
 * these files documents the literal it replaced, and that is worth keeping.
 * Crude but sufficient: it only ever removes, so it cannot create a match.
 */
function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:"'`\\])\/\/[^\n]*/g, '$1');
}

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (/\.(tsx?|css)$/.test(entry)) yield full;
  }
}

const violations = [];

for (const file of walk(SRC)) {
  const rel = relative(ROOT, file).split('\\').join('/');
  if (ALLOWED.has(rel)) continue;

  const source = stripComments(readFileSync(file, 'utf8'));
  const lines = source.split('\n');

  for (const { name, re } of RULES) {
    for (const [index, line] of lines.entries()) {
      re.lastIndex = 0;
      for (const match of line.matchAll(re)) {
        violations.push({ rel, line: index + 1, name, text: match[0] });
      }
    }
  }
}

if (violations.length > 0) {
  console.error(`\n✖ ${violations.length} colour literal(s) outside globals.css (ADR-16):\n`);
  for (const v of violations) {
    console.error(`  ${v.rel}:${v.line}  ${v.text}   — ${v.name}`);
  }
  console.error(
    '\nUse a semantic or pillar token instead. Every value is listed in docs/design.md.\n'
  );
  process.exit(1);
}

console.log('✓ No colour literals outside globals.css (ADR-16).');
