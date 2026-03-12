export function ItemRow({ item, isCompleted, onToggle }: { item: any, isCompleted: boolean, onToggle: () => void }) {
  // Map our enum BadgeType (CORE, AI, PROJECT, JOB) to the new UI colors
  const badgeColors: Record<string, string> = {
    CORE: 'bg-[#e8ff47]/10 text-[#e8ff47]',
    AI: 'bg-[#c47bff]/10 text-[#c47bff]',
    PROJECT: 'bg-[#47c8ff]/10 text-[#47c8ff]',
    JOB: 'bg-[#ff6b6b]/10 text-[#ff6b6b]',
  };

  const badgeLabels: Record<string, string> = {
    CORE: 'Core',
    AI: 'AI',
    PROJECT: 'Project',
    JOB: 'Job Signal',
  };

  const badgeClass = badgeColors[item.badge] || 'bg-[#e8ff47]/10 text-[#e8ff47]';
  const badgeLabel = badgeLabels[item.badge] || 'Core';

  return (
    <div 
      className={`
        flex items-start gap-3.5 px-3.5 py-3 mb-1 cursor-pointer 
        border transition-all duration-200 hover:translate-x-[3px]
        ${isCompleted ? 'border-[#47ff9a] bg-[#47ff9a]/[0.03]' : 'border-[#1e1e2e] bg-[#12121a] hover:border-[#3a3a5a]'}
      `}
      onClick={onToggle}
    >
      <div 
        className={`
          w-[18px] h-[18px] border-[1.5px] shrink-0 flex items-center justify-center mt-px transition-all duration-200
          ${isCompleted ? 'border-[#47ff9a] bg-[#47ff9a]' : 'border-[#6b6b8a]'}
        `}
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
          className={`text-[13px] font-medium mb-[3px] ${isCompleted ? 'line-through text-[#6b6b8a]' : 'text-[#e8e8f0]'}`}
        >
          {item.title}
        </div>
        <div className="text-[11px] text-[#6b6b8a] leading-[1.5]">
          {item.description}
        </div>
      </div>

      <span 
        className={`text-[10px] tracking-[0.07em] uppercase px-1.5 py-0.5 shrink-0 self-start mt-0.5 ${badgeClass}`}
      >
        {badgeLabel}
      </span>
    </div>
  );
}
