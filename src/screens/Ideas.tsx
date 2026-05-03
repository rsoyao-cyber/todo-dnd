import { AnimatePresence, motion } from 'framer-motion';
import { useTasks } from '../hooks/useTasks';
import TaskList from '../components/tasks/TaskList';
import TaskRow from '../components/tasks/TaskRow';
import AddTaskInput from '../components/tasks/AddTaskInput';

export default function Ideas() {
  const { tasks, addTask, toggleComplete, deleteTask, reorderTask, moveTask } = useTasks('someday');
  const open = tasks.filter(t => !t.completedAt);
  const done = tasks.filter(t => !!t.completedAt);

  return (
    <div className="flex flex-col h-full">
      <header className="shrink-0 px-5 pt-12 pb-4 border-b border-hairline">
        <p className="font-mono text-[11px] tracking-widest uppercase" style={{ color: 'var(--color-ink-3)' }}>
          {open.length} held{done.length > 0 ? ` · ${done.length} done` : ''}
        </p>
        <h1 className="font-serif text-3xl mt-0.5" style={{ color: 'var(--color-ink)' }}>
          Ideas
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        {open.length === 0 && done.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-5 py-8 font-serif italic text-base"
            style={{ color: 'var(--color-ink-3)' }}
          >
            A passing thought…
          </motion.p>
        )}

        <TaskList
          tasks={open}
          onToggle={toggleComplete}
          onDelete={deleteTask}
          onReorder={reorderTask}
          onMoveLeft={id => moveTask(id, 'week')}
          onMoveRight={id => moveTask(id, 'today')}
          labelLeft="This Week"
          labelRight="Today"
        />

        <AnimatePresence>
          {done.length > 0 && (
            <motion.div
              key="done-section"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4"
            >
              <p className="px-5 py-2 font-mono text-[10px] tracking-widest uppercase" style={{ color: 'var(--color-ink-3)' }}>
                ★ Resolved
              </p>
              {done.map(task => (
                <div key={task.id}>
                  <TaskRow
                    task={task}
                    onToggle={() => toggleComplete(task.id)}
                    onDelete={() => deleteTask(task.id)}
                  />
                  <div className="mx-5 border-b border-hairline" />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AddTaskInput onAdd={addTask} placeholder="A passing thought…" />
    </div>
  );
}
