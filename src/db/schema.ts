import Dexie, { type Table } from 'dexie';

export interface Task {
  id: string;
  title: string;
  list: 'today' | 'week' | 'someday';
  priority: number;
  createdAt: number;
  completedAt?: number;
  lastNudgedAt?: number;
  snoozedUntil?: number;
  weekId: string;
}

export class CodexDB extends Dexie {
  tasks!: Table<Task>;

  constructor() {
    super('codex');
    this.version(1).stores({
      tasks: 'id, list, weekId, priority, completedAt',
    });
  }
}

export const db = new CodexDB();
