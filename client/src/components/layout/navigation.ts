import {
  BriefcaseBusiness,
  CalendarClock,
  Clock3,
  Code2,
  HeartPulse,
  LayoutDashboard,
  Lightbulb,
  Map as MapIcon,
  Target,
  Wallet,
  type LucideIcon
} from 'lucide-react';

export type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Groups the sidebar. docs/HLD_v2.md §3 names the pillars. */
  group: 'Today' | 'Craft' | 'Life' | 'Career';
};

/**
 * Single source for navigation — the sidebar renders it, and `AppHeader`
 * resolves the current page title from it rather than duplicating the strings.
 *
 * MA-9, MA-12 and MB-10 add Health, Weekly Review and Projects here.
 */
export const NAV_LINKS: NavLink[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Today' },
  { href: '/daily-time', label: 'Daily Time', icon: Clock3, group: 'Today' },
  { href: '/next-day-plan', label: 'Next Day Plan', icon: CalendarClock, group: 'Today' },

  { href: '/roadmap', label: 'Roadmap', icon: MapIcon, group: 'Craft' },
  { href: '/dsa', label: 'Daily DSA', icon: Code2, group: 'Craft' },
  { href: '/learning-targets', label: 'Learning Targets', icon: Target, group: 'Craft' },

  { href: '/fitness', label: 'Fitness', icon: HeartPulse, group: 'Life' },
  { href: '/financial-goals', label: 'Financial Goals', icon: Wallet, group: 'Life' },

  { href: '/job-applied', label: 'Job Applied', icon: BriefcaseBusiness, group: 'Career' },
  { href: '/project-ideas', label: 'Project Ideas', icon: Lightbulb, group: 'Career' }
];

export const NAV_GROUPS = ['Today', 'Craft', 'Life', 'Career'] as const;

export function findNavLink(pathname: string): NavLink | undefined {
  return NAV_LINKS.find((link) => link.href === pathname);
}
