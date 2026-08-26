'use client';
import { useState } from 'react';
import { useRoadmap } from '@/hooks/useRoadmap';
import { PhaseCard } from '@/components/roadmap/PhaseCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Head from 'next/head';

export default function RoadmapPage() {
  const { phases, progress, links, isLoading, isLoadingLinks, toggleProgress, createLink } = useRoadmap();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-[#6b6b8a] font-mono text-sm tracking-widest uppercase animate-pulse">
          Loading Architecture...
        </div>
      </div>
    );
  }

  // Calculate overall progress
  const totalItems = phases.reduce((acc: number, p: any) => acc + (p.items?.length || 0), 0);
  const completedItems = progress.filter((p: any) => p.completed).length;
  const progressPct = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  const handleResetAll = () => {
    if (confirm('Are you sure you want to reset all progress?')) {
      const completed = progress.filter((p: any) => p.completed);
      completed.forEach((p: any) => {
        toggleProgress({ itemId: p.itemId, completed: false });
      });
    }
  };

  const handleAddLink = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    createLink(
      { title, url, notes },
      {
        onSuccess: () => {
          setTitle('');
          setUrl('');
          setNotes('');
        }
      }
    );
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
        
        body {
          background-color: #0a0a0f !important;
          color: #e8e8f0;
          font-family: 'DM Mono', monospace;
        }

        body::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(196,123,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(196,123,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
          z-index: 0;
        }
          
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeUp {
          animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}} />

      <div className="max-w-[900px] mx-auto relative z-10 px-6 py-10 pb-20 overflow-hidden font-mono text-[#e8e8f0]">
        
        {/* Header Section */}
        <header className="mb-10 animate-fadeUp">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-block text-[11px] tracking-[0.12em] uppercase px-2.5 py-1 border border-[#e8ff47] text-[#e8ff47]">
              Full-Stack Web Dev
            </span>
            <span className="inline-block text-[11px] tracking-[0.12em] uppercase px-2.5 py-1 border border-[#c47bff] text-[#c47bff]">
              AI Engineering
            </span>
          </div>

          <h1 className="text-[clamp(1.8rem,4.5vw,3rem)] font-[800] leading-[1.05] tracking-[-0.02em] mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>
            Your <span className="text-[#e8ff47]">Full-Stack</span> ×<br />
            <span className="text-[#c47bff]">AI Engineer</span> Roadmap
          </h1>
          <p className="text-[#6b6b8a] text-xs leading-[1.7] max-w-[560px]">
            A unified path for someone advanced in code, already learning GenAI, targeting a high-leverage engineering role.
          </p>
        </header>

        <section className="mb-8 rounded-2xl border border-[#1e1e2e] bg-[#101018]/80 p-4 animate-fadeUp" style={{ animationDelay: '0.02s' }}>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-sm font-semibold tracking-[0.08em] uppercase text-[#e8ff47]">Your roadmap links</h2>
              <p className="mt-1 text-xs leading-[1.7] text-[#6b6b8a]">
                The app seeds the Striver sheet and built-in AI roadmap for every user. Add your own roadmap URLs here and they will stay linked to your account.
              </p>
            </div>
          </div>

          <form className="mt-4 grid gap-3 md:grid-cols-[1.2fr_1.2fr_1.6fr_auto]" onSubmit={handleAddLink}>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Roadmap title" className="border-[#1e1e2e] bg-[#0c0c12]" />
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://... or /roadmap" className="border-[#1e1e2e] bg-[#0c0c12]" />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
              rows={1}
              className="min-h-10 w-full resize-y rounded-xl border border-[#1e1e2e] bg-[#0c0c12] px-3 py-2 text-sm text-[#e8e8f0] placeholder:text-[#6b6b8a] outline-none focus:border-[#c47bff]/60"
            />
            <Button type="submit" variant="secondary" className="h-10 border border-[#1e1e2e] bg-[#c47bff]/10 text-[#e8e8f0] hover:bg-[#c47bff]/20">
              Save Link
            </Button>
          </form>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {isLoadingLinks ? (
              <div className="text-xs text-[#6b6b8a]">Loading links...</div>
            ) : links.length > 0 ? (
              links.map((link: any) => (
                <a
                  key={link.id}
                  href={link.url}
                  target={link.url.startsWith('http') ? '_blank' : '_self'}
                  rel="noreferrer"
                  className="rounded-xl border border-[#1e1e2e] bg-[#0c0c12] p-4 transition-colors hover:border-[#c47bff]/50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-[#e8e8f0]">{link.title}</div>
                    <span className={`text-[10px] tracking-[0.1em] uppercase ${link.kind === 'DEFAULT' ? 'text-[#e8ff47]' : 'text-[#c47bff]'}`}>
                      {link.kind}
                    </span>
                  </div>
                  <div className="mt-1 break-all text-xs text-[#6b6b8a]">{link.url}</div>
                  {link.notes ? <p className="mt-2 text-xs leading-[1.6] text-[#9a9ab3]">{link.notes}</p> : null}
                </a>
              ))
            ) : (
              <div className="text-xs text-[#6b6b8a]">No links saved yet.</div>
            )}
          </div>
        </section>

        {/* Callout */}
        <div 
          className="my-6 mb-9 px-4 py-3.5 border-l-2 border-[#c47bff] bg-[#c47bff]/[0.06] text-xs leading-[1.7] animate-fadeUp"
          style={{ animationDelay: '0.05s' }}
        >
          <strong className="text-[#c47bff] font-bold">Why this combo is your edge →</strong> Most web devs don't understand LLMs deeply. Most ML folks can't ship production web apps. You're building both — which puts you in a small, highly employable category: the <strong className="text-[#c47bff] font-bold">AI Application Engineer</strong>. Companies building AI products desperately need people who can architect an LLM pipeline <em className="italic">and</em> ship the frontend around it.
        </div>

        {/* Progress Tracker */}
        <div 
          className="mb-11 animate-fadeUp"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="flex justify-between text-[11px] tracking-[0.1em] uppercase text-[#6b6b8a] mb-2">
            <span>Overall Progress</span>
            <span className="text-[#e8ff47] font-medium">{completedItems} / {totalItems} completed</span>
          </div>
          <div className="h-1 bg-[#1e1e2e] rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ 
                width: `${progressPct}%`,
                background: 'linear-gradient(90deg, #e8ff47, #c47bff)'
              }}
            />
          </div>
        </div>

        {/* Phases List */}
        <div className="space-y-0">
          {phases.length > 0 ? phases.map((phase: any, index: number) => (
            <PhaseCard 
              key={phase.id} 
              index={index}
              phase={phase} 
              userProgress={progress} 
              onToggle={toggleProgress} 
            />
          )) : (
            <div className="text-[#6b6b8a] border border-[#1e1e2e] rounded-lg p-12 text-center bg-[#12121a]/50 text-sm">
              No roadmap phases found in the database.
            </div>
          )}
        </div>

        {/* Legend */}
        {phases.length > 0 && (
          <div 
            className="flex flex-wrap gap-5 mt-10 pt-6 border-t border-[#1e1e2e] text-[11px] text-[#6b6b8a] animate-fadeUp"
            style={{ animationDelay: '0.6s' }}
          >
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-[#e8ff47]"></div> Core Skill
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-[#c47bff]"></div> AI-Specific
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-[#47c8ff]"></div> Build a Project
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-[#ff6b6b]"></div> Job Signal
            </div>
            <div className="flex-1"></div>
            <button 
              onClick={handleResetAll}
              className="bg-transparent border border-[#1e1e2e] text-[#6b6b8a] font-mono text-[11px] tracking-[0.08em] uppercase px-3.5 py-1.5 cursor-pointer transition-colors duration-200 hover:border-[#ff6b6b] hover:text-[#ff6b6b]"
            >
              Reset All
            </button>
          </div>
        )}

      </div>
    </>
  );
}
