import Link from 'next/link';
import { ArrowRight, BrainCircuit, CalendarDays, Dumbbell, Landmark, Sparkles, Target } from 'lucide-react';

const highlights = [
  {
    icon: Target,
    title: 'Goal tracking',
    description: 'Keep your learning, career, fitness, and finance goals organized in one place.'
  },
  {
    icon: BrainCircuit,
    title: 'AI assistant feel',
    description: 'Designed like a smart command center for daily progress, notes, and momentum.'
  },
  {
    icon: CalendarDays,
    title: 'Daily logging',
    description: 'Record time logs, job updates, next-day plans, and personal growth updates.'
  },
  {
    icon: Dumbbell,
    title: 'Fitness goals',
    description: 'Track gym routines and health targets with a clean, energetic visual style.'
  },
  {
    icon: Landmark,
    title: 'Financial learning',
    description: 'Capture financial goals and learning notes so money habits stay visible.'
  }
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050507] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(71,200,255,0.18),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(71,255,154,0.12),_transparent_28%),linear-gradient(to_bottom,_rgba(255,255,255,0.03),_transparent_30%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px] opacity-20" />

      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">Personal AI Assistant</p>
          <h1 className="mt-1 text-xl font-semibold">LearnerTracker</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition hover:border-cyan-300/40 hover:bg-cyan-300/10"
          >
            Log in
          </Link>
        </div>
      </nav>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-14 px-6 pb-20 pt-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:pt-20">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs text-cyan-200">
            <Sparkles className="h-4 w-4" />
            All-in-one personal AI assistant for goals and learning logs
          </div>
          <h2 className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Your personal command center for <span className="text-cyan-300">progress</span>, <span className="text-emerald-300">health</span>, and <span className="text-fuchsia-300">finance</span>.
          </h2>
          <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-neutral-300">
            Track goals, log learning, update job applications, plan tomorrow, and keep everything visible in a polished dashboard that feels like a real application — not a test app.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]"
            >
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10"
            >
              Explore features
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-10 top-10 h-32 w-32 rounded-full bg-cyan-400/20 blur-3xl animate-orb-float" />
          <div className="absolute -right-8 bottom-10 h-40 w-40 rounded-full bg-emerald-400/15 blur-3xl animate-orb-float-delayed" />
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl">
            <div className="rounded-2xl border border-white/10 bg-black/60 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Today at a glance</p>
              <div className="mt-6 space-y-3">
                {[
                  ['Learning', 'DSA + Dev + AI'],
                  ['Fitness', 'Workout + steps + recovery'],
                  ['Finance', 'Goals + notes + savings'],
                  ['Career', 'Applications + interviews']
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <span className="text-sm text-neutral-300">{label}</span>
                    <span className="text-sm font-medium text-white">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 pb-20 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Features</p>
          <h3 className="mt-3 text-3xl font-semibold">Everything you need in one dashboard</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition hover:-translate-y-1 hover:bg-white/7">
                <div className="mb-5 inline-flex rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-cyan-200">
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="text-lg font-semibold">{item.title}</h4>
                <p className="mt-2 text-sm leading-7 text-neutral-300">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
