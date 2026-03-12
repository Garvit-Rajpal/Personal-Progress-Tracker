import { useState } from 'react';
import { ItemRow } from './ItemRow';

export function PhaseCard({
  phase,
  userProgress,
  onToggle,
  index
}: {
  phase: any,
  userProgress: any[],
  onToggle: any,
  index: number
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const totalItems = phase.items?.length || 0;
  const completedItems = phase.items?.filter((item: any) => 
    userProgress.find(p => p.itemId === item.id)?.completed
  ).length || 0;

  // Determine styles by phase type
  let typeColor = '#e8ff47'; // DEFAULT (FS)
  let typeLabel = 'Full-Stack';
  if (phase.type === 'AI') {
    typeColor = '#c47bff';
    typeLabel = 'AI Engineering';
  } else if (phase.type === 'BOTH') {
    typeColor = '#47c8ff';
    typeLabel = 'Both';
  } else if (phase.type === 'FS') {
    typeColor = '#e8ff47';
    typeLabel = 'Full-Stack';
  }

  // Basic "You Are Here" heuristic (if not 100% complete and first incomplete)
  // For simplicity, we just check if it has items and isn't fully completed but has SOME progress,
  // or just pass a hardcoded prop if you want to track it precisely later. 
  // Based on HTML we'll just check if it's the first non-100% phase.
  const isYouAreHere = completedItems > 0 && completedItems < totalItems;

  return (
    <div 
      className={`mb-9 animate-fadeUp ${isCollapsed ? 'collapsed' : ''}`}
      style={{ animationDelay: `${0.1 + (index * 0.05)}s` }}
    >
      {/* Header */}
      <div 
        className="flex items-center gap-3.5 mb-3.5 cursor-pointer select-none group"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div 
          className="flex items-center justify-center shrink-0 w-8 h-8 text-[11px] font-[700] tracking-[0.1em] text-[#0a0a0f]"
          style={{ fontFamily: "'Syne', sans-serif", backgroundColor: typeColor }}
        >
          {index + 1}
        </div>
        
        <div className="flex-1">
          {isYouAreHere && (
            <div className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.1em] uppercase text-[#c47bff] mb-1.5 before:content-['▶'] before:text-[8px]">
              You are here
            </div>
          )}
          <div className="font-[700] text-[1.05rem]" style={{ fontFamily: "'Syne', sans-serif" }}>
            {phase.title}
          </div>
        </div>

        <span 
          className="text-[10px] tracking-[0.1em] uppercase px-2 py-0.5 border rounded-sm"
          style={{ color: typeColor, borderColor: typeColor }}
        >
          {typeLabel}
        </span>

        <span className="text-[11px] text-[#6b6b8a] hidden sm:block">
          {phase.duration || "2-3 weeks"}
        </span>

        <span 
          className="text-base text-[#6b6b8a] w-5 text-center transition-transform duration-300 ease-in-out"
          style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'none' }}
        >
          ▾
        </span>
      </div>

      {/* Body */}
      <div 
        className="border-l border-[#1e1e2e] ml-[15px] pl-7 overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ maxHeight: isCollapsed ? '0px' : '3000px' }}
      >
        {phase.resources && (
          <div className="my-[6px] mb-3.5 px-3.5 py-2.5 text-[11px] text-[#6b6b8a] leading-[1.8] border-l-2 border-[#1e1e2e]">
            <strong className="block mb-0.5 text-[10px] tracking-[0.1em] uppercase text-[#6b6b8a]">Resources</strong>
            {/* If resources is stored as JSON array we process it, else just print */}
            {typeof phase.resources === 'string' ? phase.resources : JSON.stringify(phase.resources)}
          </div>
        )}

        {/* Items */}
        <div className="space-y-[5px]">
          {phase.items?.map((item: any) => {
            const isCompleted = !!userProgress.find(p => p.itemId === item.id)?.completed;
            return (
              <ItemRow 
                key={item.id} 
                item={item} 
                isCompleted={isCompleted} 
                onToggle={() => onToggle({ itemId: item.id, completed: !isCompleted })}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
