import { useState, useEffect, useCallback } from 'react';
import { liveQuery } from 'dexie';
import { db, type ConsumedItem } from '../db/schema';
import { getWeekId } from '../lib/weekId';

export function useConsumedItems() {
  const [items, setItems] = useState<ConsumedItem[]>([]);

  useEffect(() => {
    const sub = liveQuery(() =>
      db.consumedItems.orderBy('completedAt').reverse().toArray()
    ).subscribe({ next: setItems, error: console.error });
    return () => sub.unsubscribe();
  }, []);

  const weekId = getWeekId();
  const thisWeekItems = items.filter(i => i.weekId === weekId);
  const earlierItems  = items.filter(i => i.weekId !== weekId);

  const addItem = useCallback(async (draft: {
    title:   string;
    type:    ConsumedItem['type'];
    rating?: ConsumedItem['rating'];
    note?:   string;
    source?: string;
  }) => {
    const now = Date.now();
    await db.consumedItems.add({
      id:          crypto.randomUUID(),
      completedAt: now,
      weekId:      getWeekId(),
      ...draft,
    });
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    await db.consumedItems.delete(id);
  }, []);

  return { items, thisWeekItems, earlierItems, addItem, deleteItem };
}
