/**
 * Theme runtime constants — docs/design.md §10, ADR-16.
 *
 * The storage key and the resolution rule live here because they are used in
 * two places that cannot import each other: the React provider, and the
 * inline `<head>` script that runs before React exists. Keeping the literal
 * in one module is what stops the two drifting apart.
 */

export type Theme = 'light' | 'dark' | 'system';

export const THEME_STORAGE_KEY = 'ppt-theme';
export const DEFAULT_THEME: Theme = 'system';

export const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)';

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system';
}

/** Resolves `system` against the OS; `light` and `dark` pass through. */
export function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme !== 'system') return theme;
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia(DARK_MEDIA_QUERY).matches ? 'dark' : 'light';
}

/** Single writer for the `.dark` class. Never toggle it from a component. */
export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', resolveTheme(theme) === 'dark');
  root.dataset.theme = theme;
}

/**
 * Runs inline and synchronously in <head>, before first paint — see
 * `app/layout.tsx`. It must stay blocking: anything deferred, or done inside a
 * component, paints the wrong theme for a frame first.
 *
 * Written as a self-contained string rather than a reference to the helpers
 * above because it is injected as raw text and has no module scope. Keep the
 * two in step; the storage key is interpolated so at least that cannot drift.
 */
export const THEME_SCRIPT = `(function(){try{
var k=${JSON.stringify(THEME_STORAGE_KEY)},s=localStorage.getItem(k);
if(s!=='light'&&s!=='dark'&&s!=='system')s=${JSON.stringify(DEFAULT_THEME)};
var d=s==='dark'||(s==='system'&&window.matchMedia(${JSON.stringify(DARK_MEDIA_QUERY)}).matches);
var r=document.documentElement;
r.classList.toggle('dark',d);r.dataset.theme=s;
}catch(e){}})();`;
