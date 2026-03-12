import { Check, ExternalLink } from 'lucide-react';

export function QuestionList({ questions, progress, onToggle, onSelect, selectedId }: { questions: any[], progress: any[], onToggle: any, onSelect: any, selectedId?: string }) {
  
  const diffColors: Record<string, string> = {
    EASY: 'text-emerald-400',
    MEDIUM: 'text-yellow-400',
    HARD: 'text-red-400',
  };

  return (
    <div className="space-y-3">
      {questions.map((q) => {
        const isCompleted = !!progress.find((p: any) => p.questionId === q.id)?.solved;
        const isSelected = selectedId === q.id;
        
        return (
          <div 
            key={q.id}
            onClick={() => onSelect(q)}
            className={`flex flex-col p-4 rounded-lg border cursor-pointer transition-colors ${
              isSelected ? 'bg-neutral-900 border-neutral-600 shadow-sm' : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            <div className="flex items-start gap-4">
              <button 
                onClick={(e) => { e.stopPropagation(); onToggle({ questionId: q.id, solved: !isCompleted }); }}
                className={`mt-1 shrink-0 flex items-center justify-center w-5 h-5 rounded border ${
                  isCompleted 
                    ? 'bg-white border-white text-black' 
                    : 'border-neutral-600 hover:border-neutral-400'
                } transition-colors`}
              >
                {isCompleted && <Check size={14} strokeWidth={3} />}
              </button>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`font-medium text-lg leading-tight ${isCompleted ? 'text-neutral-400 line-through' : 'text-neutral-100'}`}>
                    {q.title}
                  </h3>
                  <a href={q.link} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="text-neutral-500 hover:text-white transition-colors">
                    <ExternalLink size={16} />
                  </a>
                </div>
                <div className="flex gap-3 text-sm mt-3">
                  <span className={`${diffColors[q.difficulty] || 'text-neutral-400'} font-medium text-[10px] tracking-wider bg-neutral-900 border border-neutral-800 px-2 py-1 rounded`}>
                    {q.difficulty}
                  </span>
                  <span className="text-neutral-400 bg-neutral-900/50 border border-neutral-800 px-2 py-1 rounded text-[10px] uppercase font-semibold">{q.topic}</span>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  );
}
