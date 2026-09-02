import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export function NoteEditor({
  question,
  initialNotes,
  onSave,
  isSaving
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  question: any;
  initialNotes: string;
  onSave: (val: string) => void;
  isSaving: boolean;
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    // Re-seed the draft when the selected question changes. The editor is an
    // uncontrolled draft over server state, so this is a resync, not a
    // render-time derivation.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNotes(initialNotes);
    setIsDirty(false);
  }, [question.id, initialNotes]);

  const handleSave = () => {
    onSave(notes);
    setIsDirty(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-foreground">{question.title}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Notes and complexities</p>
        </div>
        <Button onClick={handleSave} disabled={!isDirty || isSaving} size="sm">
          {isSaving ? 'Saving…' : 'Save'}
        </Button>
      </div>

      <Textarea
        className="min-h-[280px] resize-y font-mono text-xs leading-6"
        placeholder="Intuition, time and space complexity, patterns worth remembering…"
        value={notes}
        onChange={(e) => {
          setNotes(e.target.value);
          setIsDirty(true);
        }}
      />
    </div>
  );
}
