import { ExternalLink } from 'lucide-react';

export function QuestionRow({ question, isCompleted, onToggle, onSelect, isSelected }: { question: any, isCompleted: boolean, onToggle: () => void, onSelect: () => void, isSelected: boolean }) {
  const diffColors: Record<string, string> = {
    EASY: 'bg-[#47ff9a]/10 text-[#47ff9a]',
    MEDIUM: 'bg-[#e8ff47]/10 text-[#e8ff47]',
    HARD: 'bg-[#ff6b6b]/10 text-[#ff6b6b]',
  };

  const badgeClass = diffColors[question.difficulty] || 'bg-[#e8ff47]/10 text-[#e8ff47]';

  return (
    <div 
      className={`
        flex items-start gap-3.5 px-3.5 py-3 mb-1 cursor-pointer 
        border transition-all duration-200 hover:translate-x-[3px]
        ${isCompleted ? 'border-[#47ff9a] bg-[#47ff9a]/[0.03]' : (isSelected ? 'border-[#c47bff] bg-[#c47bff]/[0.05]' : 'border-[#1e1e2e] bg-[#12121a] hover:border-[#3a3a5a]')}
      `}
      onClick={onSelect}
    >
      <div 
        className={`
          w-[18px] h-[18px] border-[1.5px] shrink-0 flex items-center justify-center mt-px transition-all duration-200
          ${isCompleted ? 'border-[#47ff9a] bg-[#47ff9a]' : 'border-[#6b6b8a] hover:border-[#47ff9a]/50'}
        `}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        <span 
          className="text-[11px] text-[#0a0a0f] font-bold"
          style={{ display: isCompleted ? 'block' : 'none' }}
        >
          ✓
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div 
          className={`text-[13px] font-medium mb-[3px] flex items-center gap-2 ${isCompleted ? 'line-through text-[#6b6b8a]' : 'text-[#e8e8f0]'}`}
        >
          {question.title}
          <a 
            href={question.link} 
            target="_blank" 
            rel="noreferrer" 
            onClick={e => e.stopPropagation()} 
            className="text-[#6b6b8a] hover:text-[#c47bff] transition-colors"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      <span 
        className={`text-[10px] tracking-[0.07em] uppercase px-1.5 py-0.5 shrink-0 self-start mt-0.5 ${badgeClass}`}
      >
        {question.difficulty}
      </span>
    </div>
  );
}
