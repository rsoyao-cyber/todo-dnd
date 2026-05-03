import { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import type { Task } from '../../db/schema';
import { buzz } from '../../lib/haptics';
import { playIfEnabled } from '../../lib/sound';
import { fireCompletionConfetti } from '../../lib/confetti';

interface Props {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  labelLeft?: string;
  labelRight?: string;
}

const LONG_PRESS_MS = 600;
const SWIPE_THRESHOLD = 80; // px — 30% of ~280px row content

export default function TaskRow({
  task,
  onToggle,
  onDelete,
  onMoveLeft,
  onMoveRight,
  labelLeft,
  labelRight,
}: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [pressing, setPressing] = useState(false);
  const [completing, setCompleting] = useState(false);
  const done = !!task.completedAt;

  // Swipe motion value
  const x = useMotionValue(0);
  const leftLabelOpacity = useTransform(x, [-SWIPE_THRESHOLD, -24, 0], [1, 0.4, 0]);
  const rightLabelOpacity = useTransform(x, [0, 24, SWIPE_THRESHOLD], [0, 0.4, 1]);

  // ── Long-press handlers ──────────────────────────────────────────────────
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

  // ── Completion ───────────────────────────────────────────────────────────
  const handleToggle = () => {
    if (done) { onToggle(); return; }
    if (completing) return;
    setCompleting(true);
    buzz(10);
    playIfEnabled();
    fireCompletionConfetti();
    setTimeout(() => {
      onToggle();
      // completing resets when the component re-renders with done=true from DB
    }, 460);
  };

  // ── Swipe ────────────────────────────────────────────────────────────────
  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    const dx = info.offset.x;
    if (dx < -SWIPE_THRESHOLD && onMoveLeft) {
      animate(x, -360, { duration: 0.18 });
      setTimeout(onMoveLeft, 160);
    } else if (dx > SWIPE_THRESHOLD && onMoveRight) {
      animate(x, 360, { duration: 0.18 });
      setTimeout(onMoveRight, 160);
    } else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 });
    }
  };

  return (
    <div
      className="relative overflow-hidden"
      style={{ backgroundColor: pressing ? 'var(--color-paper-3)' : undefined }}
    >
      {/* Swipe reveal labels */}
      {labelLeft && (
        <motion.div
          style={{ opacity: leftLabelOpacity }}
          className="absolute right-5 inset-y-0 flex items-center pointer-events-none"
        >
          <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: 'var(--color-ink-3)' }}>
            {labelLeft}
          </span>
        </motion.div>
      )}
      {labelRight && (
        <motion.div
          style={{ opacity: rightLabelOpacity }}
          className="absolute left-5 inset-y-0 flex items-center pointer-events-none"
        >
          <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: 'var(--color-ink-3)' }}>
            {labelRight}
          </span>
        </motion.div>
      )}

      {/* Draggable row */}
      <motion.div
        style={{ x }}
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.4}
        onDragEnd={handleDragEnd}
        className="flex items-start gap-3 px-5 py-3 select-none bg-paper"
        onMouseDown={startPress}
        onMouseUp={cancelPress}
        onMouseLeave={cancelPress}
        onTouchStart={startPress}
        onTouchEnd={cancelPress}
        onTouchMove={cancelPress}
      >
        {/* Sigil */}
        <motion.button
          onMouseDown={e => e.stopPropagation()}
          onTouchStart={e => { e.stopPropagation(); cancelPress(); }}
          onClick={handleToggle}
          className="mt-0.5 shrink-0 text-base leading-none"
          animate={{
            color: completing || done ? '#A84A2A' : '#8A7656',
            scale: completing ? [1, 1.3, 1] : 1,
          }}
          transition={{ duration: 0.2 }}
          aria-label={done ? 'Mark incomplete' : 'Mark complete'}
        >
          {completing || done ? '◆' : '◇'}
        </motion.button>

        {/* Title + strikethrough */}
        <span className="flex-1 relative">
          <motion.span
            className="block text-base leading-snug font-serif"
            animate={{
              color: completing || done ? '#8A7656' : '#2C2418',
              fontStyle: completing || done ? 'italic' : 'normal',
            }}
            transition={{ duration: 0.2, delay: completing ? 0.1 : 0 }}
          >
            {task.title}
          </motion.span>

          {/* Strikethrough sweep */}
          <motion.span
            className="absolute left-0 top-1/2 -translate-y-1/2 h-px bg-ink-3 pointer-events-none"
            initial={{ scaleX: done ? 1 : 0 }}
            animate={{ scaleX: completing || done ? 1 : 0 }}
            transition={{
              duration: 0.18,
              delay: completing ? 0.05 : 0,
              ease: 'easeOut',
            }}
            style={{
              width: '100%',
              transformOrigin: 'left',
              backgroundColor: 'var(--color-ink-3)',
            }}
          />
        </span>
      </motion.div>
    </div>
  );
}
