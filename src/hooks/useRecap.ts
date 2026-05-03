import { useState, useEffect, useCallback } from 'react';
import { liveQuery } from 'dexie';
import { db, type Idea, type IdeaMeta, type Task, type ConsumedItem } from '../db/schema';
import { getWeekId, getWeekIdOffset } from '../lib/weekId';

export interface RecapData {
  weekId:               string;
  completedTasks:       Task[];
  capturedIdeas:        IdeaMeta[];
  carriedForwardTasks:  Task[];
  consumedItems:        ConsumedItem[];
  synthesisText?:       string;
  reflection?:          string;
  saveReflection:       (text: string) => Promise<void>;
}

function toMeta({ audioBlob: _b, ...meta }: Idea): IdeaMeta {
  return meta;
}

export function useRecap(weekOffset = -1) {
  const weekId      = getWeekIdOffset(weekOffset);
  const currentWeek = getWeekId();
  const isPast      = weekId < currentWeek;

  const [data, setData] = useState<Omit<RecapData, 'saveReflection'>>({
    weekId,
    completedTasks:      [],
    capturedIdeas:       [],
    carriedForwardTasks: [],
    consumedItems:       [],
  });

  useEffect(() => {
    const sub = liveQuery(async () => {
      const [tasks, rawIdeas, items, review] = await Promise.all([
        db.tasks.where('weekId').equals(weekId).toArray(),
        db.ideas.where('weekId').equals(weekId).toArray(),
        db.consumedItems.where('weekId').equals(weekId).toArray(),
        db.weekReviews.where('weekId').equals(weekId).first(),
      ]);
      return {
        weekId,
        completedTasks:      tasks.filter(t =>  !!t.completedAt),
        capturedIdeas:       rawIdeas.filter(i => !i.archived).map(toMeta),
        carriedForwardTasks: tasks.filter(t => !t.completedAt),
        consumedItems:       items,
        synthesisText:       review?.synthesisText,
        reflection:          review?.recapNotes,
      };
    }).subscribe({ next: setData, error: console.error });
    return () => sub.unsubscribe();
  }, [weekId]);

  const saveReflection = useCallback(async (text: string) => {
    const existing = await db.weekReviews.where('weekId').equals(weekId).first();
    if (existing) {
      await db.weekReviews.update(existing.id, { recapNotes: text });
    } else {
      await db.weekReviews.add({
        id:         crypto.randomUUID(),
        weekId,
        recapNotes: text,
        createdAt:  Date.now(),
      });
    }
  }, [weekId]);

  return { ...data, isPast, saveReflection };
}
