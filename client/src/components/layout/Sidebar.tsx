'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, X } from 'lucide-react';
import { useEffect } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { NAV_GROUPS, NAV_LINKS } from './navigation';

type SidebarProps = {
  /** Controls the off-canvas drawer below `lg`. Ignored at desktop widths. */
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  // Close the drawer on navigation, so tapping a link on mobile does not
  // leave the overlay covering the page it just opened.
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <>
      {/* Scrim, drawer only. `lg:hidden` keeps it out of the desktop tree. */}
      <div
        aria-hidden={!open}
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-40 bg-foreground/20 transition-opacity duration-180 lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-180 ease-out',
          'lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
          <Link href="/dashboard" className="flex items-center gap-2 rounded-md">
            <span className="grid size-6 place-items-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground">
              PT
            </span>
            <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
              Progress Tracker
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:hidden"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV_GROUPS.map((group) => {
            const links = NAV_LINKS.filter((link) => link.group === group);
            if (links.length === 0) return null;

            return (
              <div key={group} className="mb-5 last:mb-0">
                <p className="px-2 pb-1.5 text-xs font-medium tracking-wide text-muted-foreground">
                  {group}
                </p>
                <ul className="space-y-0.5">
                  {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;

                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          aria-current={isActive ? 'page' : undefined}
                          className={cn(
                            // The active marker is a left rule in --primary,
                            // not a coloured glow (docs/design.md §1).
                            'relative flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors duration-120',
                            isActive
                              ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                              : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                          )}
                        >
                          {isActive ? (
                            <span
                              aria-hidden
                              className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-primary"
                            />
                          ) : null}
                          <Icon size={16} className="shrink-0" aria-hidden />
                          {link.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors duration-120 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <LogOut size={16} aria-hidden />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
