'use client';

import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { findNavLink } from './navigation';

export function AppHeader({ onOpenNav }: { onOpenNav: () => void }) {
  const pathname = usePathname();
  // Resolved from NAV_LINKS rather than a second list of strings.
  const current = findNavLink(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-sm sm:px-6">
      <button
        type="button"
        onClick={onOpenNav}
        aria-label="Open navigation"
        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
      >
        <Menu size={18} />
      </button>

      <span className="truncate text-sm font-medium text-foreground">
        {current?.label ?? 'Progress Tracker'}
      </span>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
