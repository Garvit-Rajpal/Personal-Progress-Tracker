import { useState } from 'react';
import { QuestionRow } from './QuestionRow';

export function TopicCard({
  topic,
  questions,
  userProgress,
  onToggle,
  onSelect,
  selectedId,
  index
}: {
  topic: string,
  questions: any[],
  userProgress: any[],
  onToggle: any,
  onSelect: any,
  selectedId?: string,
  index: number
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const totalItems = questions.length;
  const completedItems = questions.filter((q: any) => 
    userProgress.find(p => p.questionId === q.id)?.solved
  ).length;

  const typeColor = '#47c8ff'; 

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
              Active Topic
            </div>
          )}
          <div className="font-[700] text-[1.05rem]" style={{ fontFamily: "'Syne', sans-serif" }}>
            {topic}
          </div>
        </div>

        <span 
          className="text-[10px] tracking-[0.1em] uppercase px-2 py-0.5 border rounded-sm"
          style={{ color: typeColor, borderColor: typeColor }}
        >
          {completedItems}/{totalItems}
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
        {/* Items */}
        <div className="space-y-[5px]">
          {questions.map((q: any) => {
            const isCompleted = !!userProgress.find(p => p.questionId === q.id)?.solved;
            const isSelected = selectedId === q.id;
            return (
              <QuestionRow 
                key={q.id} 
                question={q} 
                isCompleted={isCompleted} 
                isSelected={isSelected}
                onSelect={() => onSelect(q)}
                onToggle={() => onToggle({ questionId: q.id, solved: !isCompleted })}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
