import { useTasks } from '../hooks/useTasks';
import TaskRow from '../components/tasks/TaskRow';
import AddTaskInput from '../components/tasks/AddTaskInput';

export default function Week() {
  const { tasks, addTask, toggleComplete, deleteTask } = useTasks('week');
  const open = tasks.filter(t => !t.completedAt);
  const done = tasks.filter(t => !!t.completedAt);

  return (
    <div className="flex flex-col h-full">
      <header className="shrink-0 px-5 pt-12 pb-4 border-b border-hairline">
        <p className="font-mono text-[11px] tracking-widest uppercase" style={{ color: 'var(--color-ink-3)' }}>
          {open.length} open{done.length > 0 ? ` · ${done.length} done` : ''}
        </p>
        <h1 className="font-serif text-3xl mt-0.5" style={{ color: 'var(--color-ink)' }}>
          This Week
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        {open.length === 0 && done.length === 0 && (
          <p className="px-5 py-8 font-serif italic text-base" style={{ color: 'var(--color-ink-3)' }}>
            Nothing inscribed yet.
          </p>
        )}

        {open.map(task => (
          <div key={task.id}>
            <TaskRow
              task={task}
              onToggle={() => toggleComplete(task.id)}
              onDelete={() => deleteTask(task.id)}
            />
            <div className="mx-5 border-b border-hairline" />
          </div>
        ))}

        {done.length > 0 && (
          <div className="mt-4">
            <p className="px-5 py-2 font-mono text-[10px] tracking-widest uppercase" style={{ color: 'var(--color-ink-3)' }}>
              ★ Closed this week
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
          </div>
        )}
      </div>

      <AddTaskInput onAdd={addTask} placeholder="Inscribe a task for the week…" />
    </div>
  );
}
