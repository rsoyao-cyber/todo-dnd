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

export interface Idea {
  id: string;
  text?: string;
  audioBlob?: Blob;
  durationMs?: number;
  createdAt: number;
  weekId: string;
  archived: boolean;
}

export type IdeaMeta = Omit<Idea, 'audioBlob'>;

export interface WeekReview {
  id: string;
  weekId: string;
  synthesisText?: string;
  recapNotes?: string;
  createdAt: number;
}

export class CodexDB extends Dexie {
  tasks!: Table<Task>;
  ideas!: Table<Idea>;
  weekReviews!: Table<WeekReview>;

  constructor() {
    super('codex');

    this.version(1).stores({
      tasks: 'id, list, weekId, priority, completedAt',
    });

    this.version(2).stores({
      tasks:       'id, list, weekId, priority, completedAt',
      ideas:       'id, weekId, createdAt',
      weekReviews: 'id, weekId',
    }).upgrade(async tx => {
      const somedayTasks = await tx.table('tasks').where('list').equals('someday').toArray();
      if (somedayTasks.length > 0) {
        await tx.table('ideas').bulkAdd(
          somedayTasks.map((t: Record<string, unknown>) => ({
            id:        t.id,
            text:      t.title,
            createdAt: t.createdAt,
            weekId:    t.weekId,
            archived:  false,
          }))
        );
        await tx.table('tasks').where('list').equals('someday').delete();
      }
    });
  }
}

export const db = new CodexDB();
