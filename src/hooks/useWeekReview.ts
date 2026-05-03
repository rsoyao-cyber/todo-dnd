import { useState, useEffect, useCallback } from 'react';
import { liveQuery } from 'dexie';
import { db, type WeekReview } from '../db/schema';
import { getWeekId } from '../lib/weekId';

export function useWeekReview() {
  const weekId = getWeekId();
  const [review, setReview] = useState<WeekReview | undefined>(undefined);

  useEffect(() => {
    const sub = liveQuery(() =>
      db.weekReviews.where('weekId').equals(weekId).first()
    ).subscribe({ next: (r) => setReview(r ?? undefined), error: console.error });
    return () => sub.unsubscribe();
  }, [weekId]);

  const saveSynthesis = useCallback(async (text: string) => {
    const existing = await db.weekReviews.where('weekId').equals(weekId).first();
    if (existing) {
      await db.weekReviews.update(existing.id, { synthesisText: text });
    } else {
      await db.weekReviews.add({
        id:        crypto.randomUUID(),
        weekId,
        synthesisText: text,
        createdAt: Date.now(),
      });
    }
  }, [weekId]);

  return { review, saveSynthesis, weekId };
}
