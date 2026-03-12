'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Map as MapIcon, Code2, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/roadmap', label: 'Roadmap', icon: MapIcon },
    { href: '/dsa', label: 'Daily DSA', icon: Code2 },
  ];

  return (
    <div className="w-64 border-r border-neutral-800 bg-black min-h-screen p-4 flex flex-col">
      <div className="mb-8 p-2">
        <h1 className="text-xl font-bold tracking-tight text-white">LearnerTracker</h1>
      </div>
      <nav className="flex-1 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (pathname === '/' && link.href === '/dashboard');
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-4 border-t border-neutral-800">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-3 py-2 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-md transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}
