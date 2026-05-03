import { useRef, useState } from 'react';
import type { Task } from '../../db/schema';

interface Props {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}

const LONG_PRESS_MS = 600;

export default function TaskRow({ task, onToggle, onDelete }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const [pressing, setPressing] = useState(false);
  const done = !!task.completedAt;

  const startPress = () => {
    setPressing(true);
    timerRef.current = setTimeout(() => {
      setPressing(false);
      onDelete();
    }, LONG_PRESS_MS);
  };

  const cancelPress = () => {
    clearTimeout(timerRef.current);
    setPressing(false);
  };

  return (
    <div
      className="flex items-start gap-3 px-5 py-3 select-none transition-colors duration-150"
      style={{ backgroundColor: pressing ? 'var(--color-paper-3)' : undefined }}
      onMouseDown={startPress}
      onMouseUp={cancelPress}
      onMouseLeave={cancelPress}
      onTouchStart={startPress}
      onTouchEnd={cancelPress}
      onTouchMove={cancelPress}
    >
      {/* Sigil toggle */}
      <button
        onMouseDown={e => e.stopPropagation()}
        onTouchStart={e => { e.stopPropagation(); cancelPress(); }}
        onClick={onToggle}
        className="mt-0.5 shrink-0 text-base leading-none transition-colors"
        style={{ color: done ? 'var(--color-accent)' : 'var(--color-ink-3)' }}
        aria-label={done ? 'Mark incomplete' : 'Mark complete'}
      >
        {done ? '◆' : '◇'}
      </button>

      {/* Title */}
      <span
        className="flex-1 text-base leading-snug font-serif"
        style={{
          color: done ? 'var(--color-ink-3)' : 'var(--color-ink)',
          fontStyle: done ? 'italic' : undefined,
        }}
      >
        {task.title}
      </span>
    </div>
  );
}
