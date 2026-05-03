import { useRef, useState } from 'react';
import { db } from '../db/schema';
import { isSoundEnabled, setSoundEnabled } from '../lib/sound';

interface Props {
  onClose: () => void;
}

async function exportData() {
  const tasks = await db.tasks.toArray();
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    tasks,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `todo-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function importData(file: File): Promise<string> {
  const text = await file.text();
  let data: { version?: number; tasks?: unknown[] };
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('File is not valid JSON.');
  }
  if (!Array.isArray(data.tasks)) {
    throw new Error('Unrecognised format — missing "tasks" array.');
  }
  const taskCount = data.tasks.length;
  const confirmed = window.confirm(
    `Replace all current data with ${taskCount} task${taskCount === 1 ? '' : 's'} from this backup?\n\nThis cannot be undone.`
  );
  if (!confirmed) return 'cancelled';

  await db.transaction('rw', db.tasks, async () => {
    await db.tasks.clear();
    if (taskCount > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await db.tasks.bulkAdd(data.tasks as any[]);
    }
  });
  return 'ok';
}

export default function Settings({ onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [soundOn, setSoundOn] = useState(isSoundEnabled);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };

  const handleExport = async () => {
    try {
      await exportData();
    } catch (err) {
      alert(`Export failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const result = await importData(file);
      if (result === 'ok') {
        alert('Import complete.');
        onClose();
      }
    } catch (err) {
      alert(`Import failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="shrink-0 px-5 pt-12 pb-4 border-b border-hairline flex items-end justify-between">
        <h1 className="font-serif text-3xl" style={{ color: 'var(--color-ink)' }}>
          Settings
        </h1>
        <button
          onClick={onClose}
          className="font-mono text-[10px] tracking-widest uppercase pb-1"
          style={{ color: 'var(--color-ink-3)' }}
        >
          Back
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-3">
        <p className="font-mono text-[10px] tracking-widest uppercase mb-1" style={{ color: 'var(--color-ink-3)' }}>
          Feel
        </p>

        <button
          onClick={toggleSound}
          className="w-full flex items-center justify-between px-4 py-3 border border-hairline font-serif text-base"
          style={{ backgroundColor: 'var(--color-paper-2)', color: 'var(--color-ink)' }}
        >
          <span>
            Completion sound
            <span className="block font-mono text-[10px] tracking-wider uppercase mt-0.5" style={{ color: 'var(--color-ink-3)' }}>
              Short click on task complete
            </span>
          </span>
          <span
            className="font-mono text-[10px] tracking-widest uppercase shrink-0 ml-4"
            style={{ color: soundOn ? 'var(--color-accent)' : 'var(--color-ink-3)' }}
          >
            {soundOn ? 'On' : 'Off'}
          </span>
        </button>

        <p className="font-mono text-[10px] tracking-widest uppercase mb-1 mt-4" style={{ color: 'var(--color-ink-3)' }}>
          Data
        </p>

        <button
          onClick={handleExport}
          className="w-full text-left px-4 py-3 border border-hairline font-serif text-base transition-colors"
          style={{ backgroundColor: 'var(--color-paper-2)', color: 'var(--color-ink)' }}
        >
          Export data
          <span className="block font-mono text-[10px] tracking-wider uppercase mt-0.5" style={{ color: 'var(--color-ink-3)' }}>
            Downloads a JSON backup of all tasks
          </span>
        </button>

        <button
          onClick={() => fileRef.current?.click()}
          className="w-full text-left px-4 py-3 border border-hairline font-serif text-base transition-colors"
          style={{ backgroundColor: 'var(--color-paper-2)', color: 'var(--color-ink)' }}
        >
          Import data
          <span className="block font-mono text-[10px] tracking-wider uppercase mt-0.5" style={{ color: 'var(--color-ink-3)' }}>
            Replaces all current data from a JSON backup
          </span>
        </button>

        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
