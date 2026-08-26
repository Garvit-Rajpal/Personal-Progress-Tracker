'use client';
import { Sidebar } from '@/components/layout/Sidebar';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
    } else if (pathname === '/') {
      router.push('/dashboard');
    }
  }, [router, pathname]);

  if (!mounted) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-900 text-white">
      <Sidebar />
      <main className="min-h-0 flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
