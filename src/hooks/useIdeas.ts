import { useState, useEffect, useCallback } from 'react';
import { liveQuery } from 'dexie';
import { db, type Idea, type IdeaMeta } from '../db/schema';
import { getWeekId } from '../lib/weekId';

function toMeta({ audioBlob: _b, ...meta }: Idea): IdeaMeta {
  return meta;
}

export function useIdeas() {
  const [allMeta, setAllMeta] = useState<IdeaMeta[]>([]);

  useEffect(() => {
    const sub = liveQuery(async () => {
      const rows = await db.ideas.orderBy('createdAt').reverse().toArray();
      // Strip blobs — blobs are lazy-loaded in IdeaRow on play
      return rows.map(toMeta);
    }).subscribe({ next: setAllMeta, error: console.error });
    return () => sub.unsubscribe();
  }, []);

  const ideasThisWeek = useCallback((): IdeaMeta[] => {
    const weekId = getWeekId();
    return allMeta.filter(i => i.weekId === weekId && !i.archived);
  }, [allMeta]);

  const allIdeas = useCallback((): IdeaMeta[] => {
    return allMeta.filter(i => !i.archived);
  }, [allMeta]);

  const addTextIdea = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    await db.ideas.add({
      id:        crypto.randomUUID(),
      text:      trimmed,
      createdAt: Date.now(),
      weekId:    getWeekId(),
      archived:  false,
    });
  }, []);

  const addVoiceIdea = useCallback(async (blob: Blob, durationMs: number) => {
    await db.ideas.add({
      id:         crypto.randomUUID(),
      audioBlob:  blob,
      durationMs,
      createdAt:  Date.now(),
      weekId:     getWeekId(),
      archived:   false,
    });
  }, []);

  const archiveIdea = useCallback(async (id: string) => {
    await db.ideas.update(id, { archived: true });
  }, []);

  const deleteIdea = useCallback(async (id: string) => {
    await db.ideas.delete(id);
  }, []);

  return { ideasThisWeek, allIdeas, addTextIdea, addVoiceIdea, archiveIdea, deleteIdea };
}
