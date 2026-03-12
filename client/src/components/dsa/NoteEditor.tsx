import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export function NoteEditor({ question, initialNotes, onSave, isSaving }: { question: any, initialNotes: string, onSave: (val: string) => void, isSaving: boolean }) {
  const [notes, setNotes] = useState(initialNotes);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setNotes(initialNotes);
    setIsDirty(false);
  }, [question.id, initialNotes]);

  const handleSave = () => {
    onSave(notes);
    setIsDirty(false);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="border-b border-neutral-800 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">{question.title}</h2>
          <p className="text-neutral-500 text-sm mt-1">Study Notes & Complexities</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={!isDirty || isSaving}
          variant={isDirty ? "default" : "secondary"}
          size="sm"
        >
          {isSaving ? "Saving..." : "Save Notes"}
        </Button>
      </div>
      
      <div className="flex-1">
        <textarea
          className="w-full h-full min-h-[300px] bg-transparent resize-none text-neutral-300 placeholder:text-neutral-700 outline-none p-2 font-mono text-sm leading-relaxed"
          placeholder="Write down your intuition, O(N) time/space complexities, or useful patterns..."
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setIsDirty(true);
          }}
        />
      </div>
    </div>
  );
}
