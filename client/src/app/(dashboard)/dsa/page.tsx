'use client';
import { useDSA } from '@/hooks/useDSA';
import { TopicCard } from '@/components/dsa/TopicCard';
import { NoteEditor } from '@/components/dsa/NoteEditor';
import { useState, useMemo } from 'react';

export default function DSAPage() {
  const { allQuestions, progress, isLoading, toggleSolved, saveNotes, isSavingNotes } = useDSA();
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);

  const groupedQuestions = useMemo(() => {
    if (!allQuestions || !Array.isArray(allQuestions)) return {};
    return allQuestions.reduce((acc: any, q: any) => {
      if (!acc[q.topic]) acc[q.topic] = [];
      acc[q.topic].push(q);
      return acc;
    }, {});
  }, [allQuestions]);

  const topics = useMemo(() => Object.keys(groupedQuestions), [groupedQuestions]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-[#6b6b8a] font-mono text-sm tracking-widest uppercase animate-pulse">
          Loading Striver's SDE Sheet...
        </div>
      </div>
    );
  }

  const handleSelect = (question: any) => {
    setSelectedQuestion(question);
  };

  const selectedProgress = selectedQuestion 
    ? progress.find((p: any) => p.questionId === selectedQuestion.id) 
    : null;

  const totalItems = allQuestions.length;
  const completedItems = progress.filter((p: any) => p.solved).length;
  const progressPct = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

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
            linear-gradient(rgba(71,200,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(71,200,255,0.03) 1px, transparent 1px);
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

      <div className="max-w-[1200px] mx-auto relative z-10 px-6 py-6 pb-20 font-mono text-[#e8e8f0] flex flex-col lg:flex-row gap-10">
        
        {/* LEFT COLUMN: The Roadmap List */}
        <div className="flex-1 lg:max-w-[600px]">
          <header className="mb-10 animate-fadeUp">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-block text-[11px] tracking-[0.12em] uppercase px-2.5 py-1 border border-[#47c8ff] text-[#47c8ff]">
                Data Structures & Algorithms
              </span>
            </div>

            <h1 className="text-[clamp(1.8rem,3vw,2.5rem)] font-[800] leading-[1.05] tracking-[-0.02em] mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>
              Striver's <span className="text-[#47c8ff]">SDE Sheet</span>
            </h1>
            <p className="text-[#6b6b8a] text-xs leading-[1.7] max-w-[560px]">
              Top coding interview problems, meticulously structured. Track your progress and complexities here.
            </p>
          </header>

          {/* Progress Tracker */}
          <div 
            className="mb-11 animate-fadeUp"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="flex justify-between text-[11px] tracking-[0.1em] uppercase text-[#6b6b8a] mb-2">
              <span>Overall Progress</span>
              <span className="text-[#47c8ff] font-medium">{completedItems} / {totalItems} completed</span>
            </div>
            <div className="h-1 bg-[#1e1e2e] rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ 
                  width: `${progressPct}%`,
                  background: 'linear-gradient(90deg, #47c8ff, #47ff9a)'
                }}
              />
            </div>
          </div>

          <pre className="text-xs p-4 bg-red-900/20 mb-4 overflow-auto max-h-[200px] text-white hidden">
            DEBUG: allQuestions.length = {Array.isArray(allQuestions) ? allQuestions.length : 0}
            {JSON.stringify(groupedQuestions, null, 2)}
          </pre>

          <div className="space-y-0 pb-10">
            {topics.length > 0 ? topics.map((topic: string, index: number) => (
              <TopicCard 
                key={topic}
                topic={topic}
                questions={groupedQuestions[topic]}
                userProgress={progress}
                onToggle={toggleSolved}
                onSelect={handleSelect}
                selectedId={selectedQuestion?.id}
                index={index}
              />
            )) : (
              <div className="text-[#6b6b8a] border border-[#1e1e2e] rounded-lg p-12 text-center bg-[#12121a]/50 text-sm">
                No questions found in the database.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: The Note Editor */}
        <div className="lg:w-[450px] shrink-0">
          <div className="sticky top-[100px]">
            {selectedQuestion ? (
              <div className="border border-[#1e1e2e] bg-[#12121a] rounded-lg p-6 shadow-xl animate-fadeUp" style={{ animationDelay: '0.2s' }}>
                <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
                   {selectedQuestion.title}
                </h2>
                <NoteEditor 
                  question={selectedQuestion} 
                  initialNotes={selectedProgress?.notes || ''} 
                  onSave={(notes: string) => saveNotes({ questionId: selectedQuestion.id, notes })}
                  isSaving={isSavingNotes}
                />
              </div>
            ) : (
              <div className="border border-[#1e1e2e] bg-[#12121a]/50 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center text-[#6b6b8a] min-h-[300px]">
                <div className="w-12 h-12 mb-4 rounded-full border border-[#1e1e2e] flex items-center justify-center text-[#1e1e2e]">
                  <span className="text-2xl">📝</span>
                </div>
                <p className="text-sm">Select a question from the list to add study notes and time/space complexities.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
