import Dexie, { type Table } from 'dexie';

export interface Task {
  id: string;
  title: string;
  list: 'today' | 'week' | 'someday';
  priority: number;
  createdAt: number;
  completedAt?: number;
  lastNudgedAt?: number;
  lastSeenAt?: number;
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

export interface ConsumedItem {
  id: string;
  title: string;
  type: 'book' | 'movie' | 'show' | 'video' | 'game' | 'other';
  rating?: 1 | 2 | 3 | 4 | 5;
  note?: string;
  source?: string;
  completedAt: number;
  weekId: string;
}

export class CodexDB extends Dexie {
  tasks!: Table<Task>;
  ideas!: Table<Idea>;
  weekReviews!: Table<WeekReview>;
  consumedItems!: Table<ConsumedItem>;

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

    this.version(3).stores({
      tasks:       'id, list, weekId, priority, completedAt, lastSeenAt',
      ideas:       'id, weekId, createdAt',
      weekReviews: 'id, weekId',
    });

    // v4: adds consumedItems (the Codex / Library tab)
    this.version(4).stores({
      tasks:         'id, list, weekId, priority, completedAt, lastSeenAt',
      ideas:         'id, weekId, createdAt',
      weekReviews:   'id, weekId',
      consumedItems: 'id, weekId, completedAt, type',
    });
  }
}

export const db = new CodexDB();
