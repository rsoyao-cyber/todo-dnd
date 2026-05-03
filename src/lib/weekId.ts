export function getWeekId(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function getWeekNumber(weekId: string): number {
  const match = weekId.match(/W(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

// "2026-W18" → "MAY 4 — 10"
export function getWeekDateRange(weekId: string): string {
  const match = weekId.match(/(\d{4})-W(\d+)/);
  if (!match) return weekId;
  const year = parseInt(match[1]);
  const week = parseInt(match[2]);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dow = jan4.getUTCDay() || 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - dow + 1 + (week - 1) * 7);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  const mo = monday.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }).toUpperCase();
  const so = sunday.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }).toUpperCase();
  if (monday.getUTCMonth() === sunday.getUTCMonth()) {
    return `${mo} ${monday.getUTCDate()} — ${sunday.getUTCDate()}`;
  }
  return `${mo} ${monday.getUTCDate()} — ${so} ${sunday.getUTCDate()}`;
}
