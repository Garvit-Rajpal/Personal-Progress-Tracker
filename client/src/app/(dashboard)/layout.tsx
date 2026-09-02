'use client';
import { Sidebar } from '@/components/layout/Sidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { useCallback, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    // Client-side auth gate: localStorage is only readable after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
    } else if (pathname === '/') {
      router.push('/dashboard');
    }
  }, [router, pathname]);

  const closeNav = useCallback(() => setNavOpen(false), []);

  if (!mounted) return null;

  return (
    // ADR-16 — tokens, not `bg-neutral-900 text-white`. V1's literal here
    // overrode --background, so the theme was never actually visible.
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar open={navOpen} onClose={closeNav} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader onOpenNav={() => setNavOpen(true)} />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
