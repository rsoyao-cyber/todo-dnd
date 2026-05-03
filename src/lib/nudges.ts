import { db } from '../db/schema';

const THRESHOLD_KEY = 'codex-nudge-threshold-days';

export function getNudgeThreshold(): number {
  const v = localStorage.getItem(THRESHOLD_KEY);
  return v ? parseInt(v, 10) : 3;
}

export function setNudgeThreshold(days: number) {
  localStorage.setItem(THRESHOLD_KEY, String(days));
}

export async function getStaleTasks(thresholdDays = getNudgeThreshold()) {
  const now = Date.now();
  const cutoff = thresholdDays * 24 * 60 * 60 * 1000;
  const tasks = await db.tasks.toArray();
  return tasks
    .filter(t =>
      !t.completedAt &&
      (!t.snoozedUntil || t.snoozedUntil < now) &&
      (now - (t.lastSeenAt ?? t.createdAt)) > cutoff
    )
    // Oldest first — the most neglected task leads
    .sort((a, b) => (a.lastSeenAt ?? a.createdAt) - (b.lastSeenAt ?? b.createdAt));
}

export async function snoozeTask(id: string, days: number) {
  await db.tasks.update(id, {
    snoozedUntil:  Date.now() + days * 24 * 60 * 60 * 1000,
    lastNudgedAt:  Date.now(),
  });
}

export async function dropTask(id: string) {
  await db.tasks.delete(id);
}
