'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  DARK_MEDIA_QUERY,
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  applyTheme,
  isTheme,
  resolveTheme,
  type Theme
} from '@/lib/theme';

type ThemeContextValue = {
  /** What the user chose: light, dark, or system. */
  theme: Theme;
  /** What that currently resolves to. Follows the OS while theme is system. */
  resolved: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // The inline <head> script (ADR-16) has already applied the correct class by
  // the time this mounts. Seed from the DOM it wrote rather than re-reading
  // localStorage, so the provider and the pre-paint state cannot disagree.
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [resolved, setResolved] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Adopting state the inline <head> script already committed to the DOM —
    // it cannot be read during render without a hydration mismatch, so this
    // is the "subscribe to an external system" case the rule exempts.
    const fromDom = document.documentElement.dataset.theme;
    const initial = isTheme(fromDom) ? fromDom : DEFAULT_THEME;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(initial);
    setResolved(resolveTheme(initial));
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    setResolved(resolveTheme(next));
    applyTheme(next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private mode or blocked storage. The theme still applies for this
      // session; only persistence is lost.
    }
  }, []);

  // Follow the OS live while in `system` mode — no reload (docs/design.md §10).
  useEffect(() => {
    if (theme !== 'system') return;

    const media = window.matchMedia(DARK_MEDIA_QUERY);
    const onChange = () => {
      applyTheme('system');
      setResolved(media.matches ? 'dark' : 'light');
    };

    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside <ThemeProvider>');
  }
  return context;
}
