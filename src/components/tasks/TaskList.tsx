import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, Reorder } from 'framer-motion';
import type { Task } from '../../db/schema';
import TaskRow from './TaskRow';

interface Props {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onMoveLeft?: (id: string) => void;
  onMoveRight?: (id: string) => void;
  onReorder: (id: string, priority: number) => void;
  labelLeft?: string;
  labelRight?: string;
}

export default function TaskList({
  tasks,
  onToggle,
  onDelete,
  onMoveLeft,
  onMoveRight,
  onReorder,
  labelLeft,
  labelRight,
}: Props) {
  // Local order state for smooth drag-to-reorder without waiting for Dexie round-trip
  const [localOrder, setLocalOrder] = useState<Task[]>(tasks);
  // Track which IDs have already stagger-animated so they don't re-animate on re-renders
  const animatedIds = useRef(new Set<string>());

  // Keep local order in sync with DB (but only when not mid-drag)
  const isDragging = useRef(false);
  useEffect(() => {
    if (!isDragging.current) setLocalOrder(tasks);
  }, [tasks]);

  const handleReorder = (newOrder: Task[]) => {
    setLocalOrder(newOrder);
    // Find the moved item by comparing indices
    for (let i = 0; i < newOrder.length; i++) {
      if (newOrder[i].id !== localOrder[i]?.id) {
        const moved = newOrder[i];
        const above = newOrder[i - 1];
        const below = newOrder[i + 1];
        const priority =
          above && below ? (above.priority + below.priority) / 2
          : above        ? above.priority + 1000
          : below        ? below.priority - 1000
          : moved.priority;
        onReorder(moved.id, priority);
        break;
      }
    }
  };

  return (
    <Reorder.Group
      axis="y"
      values={localOrder}
      onReorder={handleReorder}
      as="div"
      className="outline-none"
      onMouseDown={() => { isDragging.current = true; }}
      onMouseUp={() => { isDragging.current = false; }}
      onTouchStart={() => { isDragging.current = true; }}
      onTouchEnd={() => { isDragging.current = false; }}
    >
      <AnimatePresence>
        {localOrder.map((task, index) => {
          const isNew = !animatedIds.current.has(task.id);
          if (isNew) animatedIds.current.add(task.id);

          return (
            <Reorder.Item
              key={task.id}
              value={task}
              as="div"
              initial={isNew ? { opacity: 0, y: 8 } : false}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{
                layout: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
                opacity: { duration: 0.25, delay: isNew ? index * 0.03 : 0 },
                y:       { duration: 0.25, delay: isNew ? index * 0.03 : 0 },
                height:  { duration: 0.14 },
              }}
              dragListener
              whileDrag={{ scale: 1.02, zIndex: 10, boxShadow: '0 4px 16px rgba(44,36,24,0.10)' }}
            >
              <TaskRow
                task={task}
                onToggle={() => onToggle(task.id)}
                onDelete={() => onDelete(task.id)}
                onMoveLeft={onMoveLeft ? () => onMoveLeft(task.id) : undefined}
                onMoveRight={onMoveRight ? () => onMoveRight(task.id) : undefined}
                labelLeft={labelLeft}
                labelRight={labelRight}
              />
              <div className="mx-5 border-b border-hairline" />
            </Reorder.Item>
          );
        })}
      </AnimatePresence>
    </Reorder.Group>
  );
}
