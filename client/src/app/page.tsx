import Link from 'next/link';
import {
  ArrowRight,
  BrainCircuit,
  CalendarDays,
  Dumbbell,
  Landmark,
  Target
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

// ADR-16 — the landing page ran its own visual system (#050507, grid overlay,
// float orbs, three accent hues). It now uses the same tokens as the app, so
// signing in is not a jarring change of product.
const highlights = [
  {
    icon: Target,
    title: 'Goal tracking',
    description: 'Learning, career, fitness and finance goals in one place.',
    tone: 'text-pillar-career'
  },
  {
    icon: BrainCircuit,
    title: 'Craft progress',
    description: 'A roadmap and the Striver sheet, tracked item by item.',
    tone: 'text-pillar-craft'
  },
  {
    icon: CalendarDays,
    title: 'Daily logging',
    description: 'Time logs, job updates and tomorrow’s plan in under two minutes.',
    tone: 'text-pillar-devai'
  },
  {
    icon: Dumbbell,
    title: 'Fitness goals',
    description: 'Routines and health targets alongside everything else.',
    tone: 'text-pillar-fitness'
  },
  {
    icon: Landmark,
    title: 'Financial learning',
    description: 'Money goals and learning notes stay visible, not buried.',
    tone: 'text-pillar-finance'
  }
];

const GLANCE: [string, string][] = [
  ['Learning', 'DSA + Dev + AI'],
  ['Fitness', 'Workout, steps, recovery'],
  ['Finance', 'Goals, notes, savings'],
  ['Career', 'Applications + interviews']
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="grid size-6 place-items-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground">
            PT
          </span>
          <span className="text-sm font-semibold tracking-tight">Progress Tracker</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button render={<Link href="/login" />} size="sm">
            Log in
          </Button>
        </div>
      </nav>

      <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-10 lg:grid-cols-[1.1fr_0.9fr] lg:pt-20">
        <div>
          <h1 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            A command center for your progress, health and finances.
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-base leading-7 text-muted-foreground">
            Track goals, log learning, update job applications and plan tomorrow — calibrated to a
            real 1–2 hours a day, not to a schedule nobody keeps.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button render={<Link href="/login" />}>
              Get started
              <ArrowRight aria-hidden />
            </Button>
            <Button render={<a href="#features" />} variant="outline">
              Explore features
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground">Today at a glance</p>
            <div className="space-y-2">
              {GLANCE.map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/40 px-3 py-2.5"
                >
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-sm font-medium text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="text-2xl font-semibold tracking-tight">Everything in one dashboard</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title}>
                <CardContent className="space-y-2">
                  <Icon className={`size-5 ${item.tone}`} aria-hidden />
                  <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </main>
  );
}
