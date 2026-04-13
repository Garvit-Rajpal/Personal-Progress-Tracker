'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Map as MapIcon, Code2, BriefcaseBusiness, Lightbulb, Clock3, Target, CalendarClock, HeartPulse, Wallet, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/roadmap', label: 'Roadmap', icon: MapIcon },
    { href: '/dsa', label: 'Daily DSA', icon: Code2 },
    { href: '/daily-time', label: 'Daily Time', icon: Clock3 },
    { href: '/learning-targets', label: 'Learning Targets', icon: Target },
    { href: '/fitness', label: 'Fitness', icon: HeartPulse },
    { href: '/financial-goals', label: 'Financial Goals', icon: Wallet },
    { href: '/next-day-plan', label: 'Next Day Plan', icon: CalendarClock },
    { href: '/job-applied', label: 'Job Applied', icon: BriefcaseBusiness },
    { href: '/project-ideas', label: 'Project Ideas', icon: Lightbulb },
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
