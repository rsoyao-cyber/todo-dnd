import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Task } from '../db/schema';
import { getStaleTasks, snoozeTask, dropTask } from '../lib/nudges';
import { Fleuron } from './shared/Fleuron';

const SESSION_KEY = 'codex-nudge-shown';

interface Props {
  onGoToToday: () => void;
}

function staleDays(task: Task): number {
  return Math.round((Date.now() - (task.lastSeenAt ?? task.createdAt)) / 86_400_000);
}

export default function NudgeBanner({ onGoToToday }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, '1');

    getStaleTasks().then(stale => {
      if (stale.length > 0) {
        setTasks(stale);
        setVisible(true);
      }
    });
  }, []);

  const current = tasks[index];

  const advance = () => {
    const next = index + 1;
    if (next < tasks.length) {
      setIndex(next);
    } else {
      setVisible(false);
    }
  };

  const handleDoItNow = () => {
    onGoToToday();
    advance();
  };

  const handleSnooze = async () => {
    if (!current) return;
    await snoozeTask(current.id, 3);
    advance();
  };

  const handleDrop = async () => {
    if (!current) return;
    const ok = window.confirm(`Drop "${current.title}"?\n\nThis removes it entirely.`);
    if (!ok) return;
    await dropTask(current.id);
    // Remove from local list too
    const next = tasks.filter(t => t.id !== current.id);
    if (next.length === 0) {
      setVisible(false);
    } else {
      setTasks(next);
      setIndex(i => Math.min(i, next.length - 1));
    }
  };

  return (
    <AnimatePresence>
      {visible && current && (
        <motion.div
          key="nudge-banner"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
          className="mx-4 mt-3 border border-hairline"
          style={{ backgroundColor: 'var(--color-paper-2)' }}
        >
          {/* Fleuron ornament */}
          <div className="flex justify-center pt-3">
            <Fleuron color="var(--color-hairline)" w={60} />
          </div>

          {/* Header */}
          <div className="flex items-start justify-between px-4 pt-2 pb-2">
            <div>
              <p className="font-mono text-[10px] tracking-widest uppercase" style={{ color: 'var(--color-accent)' }}>
                Resting · {staleDays(current)} day{staleDays(current) !== 1 ? 's' : ''}
                {tasks.length > 1 && (
                  <span style={{ color: 'var(--color-ink-3)' }}>
                    {' '}· {index + 1} of {tasks.length}
                  </span>
                )}
              </p>
              <p className="font-serif text-base leading-snug mt-1" style={{ color: 'var(--color-ink)' }}>
                "{current.title}"
              </p>
              <p className="font-serif italic text-sm mt-1" style={{ color: 'var(--color-ink-3)' }}>
                No pressure. Still worth doing?
              </p>
            </div>
            <button
              onClick={() => setVisible(false)}
              className="font-mono text-base leading-none ml-3 shrink-0 mt-0.5"
              style={{ color: 'var(--color-ink-3)' }}
              aria-label="Dismiss nudge"
            >
              ×
            </button>
          </div>

          {/* Actions */}
          <div className="flex border-t border-hairline divide-x divide-hairline">
            <button
              onClick={handleDoItNow}
              className="flex-1 py-3 font-mono text-[10px] tracking-widest uppercase text-center"
              style={{ color: 'var(--color-ink)' }}
            >
              Do it now
            </button>
            <button
              onClick={handleSnooze}
              className="flex-1 py-3 font-mono text-[10px] tracking-widest uppercase text-center"
              style={{ color: 'var(--color-ink-3)' }}
            >
              Snooze 3d
            </button>
            <button
              onClick={handleDrop}
              className="flex-1 py-3 font-mono text-[10px] tracking-widest uppercase text-center"
              style={{ color: 'var(--color-ink-3)' }}
            >
              Drop it
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
