import { useState, useEffect, useCallback } from 'react';
import { liveQuery } from 'dexie';
import { db, type Task } from '../db/schema';
import { getWeekId } from '../lib/weekId';

export function useTasks(list: Task['list']) {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const sub = liveQuery(() =>
      db.tasks.where('list').equals(list).sortBy('priority')
    ).subscribe({ next: setTasks, error: console.error });
    return () => sub.unsubscribe();
  }, [list]);

  const addTask = useCallback(async (title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    await db.tasks.add({
      id: crypto.randomUUID(),
      title: trimmed,
      list,
      priority: Date.now(),
      createdAt: Date.now(),
      weekId: getWeekId(),
    });
  }, [list]);

  const toggleComplete = useCallback(async (id: string) => {
    const task = await db.tasks.get(id);
    if (!task) return;
    await db.tasks.update(id, {
      completedAt: task.completedAt ? undefined : Date.now(),
    });
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    await db.tasks.delete(id);
  }, []);

  return { tasks, addTask, toggleComplete, deleteTask };
}
