import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useIdeas } from '../hooks/useIdeas';
import { useWeekReview } from '../hooks/useWeekReview';

interface Props {
  onClose: () => void;
}

function weekLabel(weekId: string): string {
  // "2026-W18" — extract the number for display
  const match = weekId.match(/(\d{4})-W(\d+)/);
  if (!match) return weekId;
  // Find the Monday of that ISO week for a human date
  const year = parseInt(match[1]);
  const week = parseInt(match[2]);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayOfWeek = jan4.getUTCDay() || 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - dayOfWeek + 1 + (week - 1) * 7);
  return monday.toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' });
}

export default function WeeklyReview({ onClose }: Props) {
  const { ideasThisWeek } = useIdeas();
  const { review, saveSynthesis, weekId } = useWeekReview();
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  const ideas = ideasThisWeek();

  // Populate textarea from saved review
  useEffect(() => {
    if (review?.synthesisText !== undefined) {
      setText(review.synthesisText ?? '');
    }
  }, [review?.synthesisText]);

  const handleSave = async () => {
    setSaving(true);
    await saveSynthesis(text);
    setSaving(false);
    onClose();
  };

  return (
    <div className="flex flex-col h-full">
      <header className="shrink-0 px-5 pt-12 pb-4 border-b border-hairline flex items-end justify-between">
        <div>
          <p className="font-mono text-[11px] tracking-widest uppercase" style={{ color: 'var(--color-ink-3)' }}>
            Week of {weekLabel(weekId)} · {ideas.length} idea{ideas.length !== 1 ? 's' : ''}
          </p>
          <h1 className="font-serif text-3xl mt-0.5" style={{ color: 'var(--color-ink)' }}>
            Review
          </h1>
        </div>
        <button
          onClick={onClose}
          className="font-mono text-[10px] tracking-widest uppercase pb-1"
          style={{ color: 'var(--color-ink-3)' }}
        >
          Close
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6">
        {/* Ideas list — read-only */}
        {ideas.length > 0 ? (
          <section>
            <p className="font-mono text-[10px] tracking-widest uppercase mb-3" style={{ color: 'var(--color-ink-3)' }}>
              Captured this week
            </p>
            <div className="flex flex-col gap-3">
              {ideas.map((idea, i) => (
                <motion.div
                  key={idea.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                >
                  <p className="font-serif text-base leading-snug" style={{ color: 'var(--color-ink-2)' }}>
                    {idea.text
                      ? `"${idea.text}"`
                      : `Voice note · ${idea.durationMs ? Math.round(idea.durationMs / 1000) + 's' : '—'}`
                    }
                  </p>
                </motion.div>
              ))}
            </div>
          </section>
        ) : (
          <p className="font-serif italic text-base" style={{ color: 'var(--color-ink-3)' }}>
            No ideas captured this week yet.
          </p>
        )}

        {/* Synthesis notes */}
        <section className="flex flex-col gap-2">
          <p className="font-mono text-[10px] tracking-widest uppercase" style={{ color: 'var(--color-ink-3)' }}>
            What's worth carrying forward?
          </p>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Synthesis notes…"
            rows={6}
            className="w-full border border-hairline px-4 py-3 font-serif text-base resize-none outline-none placeholder:italic"
            style={{
              backgroundColor: 'var(--color-paper-2)',
              color: 'var(--color-ink)',
              caretColor: 'var(--color-accent)',
            }}
          />
        </section>
      </div>

      <div
        className="shrink-0 px-5 py-4 border-t border-hairline"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
      >
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 font-mono text-[11px] tracking-widest uppercase border border-hairline transition-colors"
          style={{
            backgroundColor: 'var(--color-paper-2)',
            color: saving ? 'var(--color-ink-3)' : 'var(--color-ink)',
          }}
        >
          {saving ? 'Saving…' : 'Save synthesis'}
        </button>
      </div>
    </div>
  );
}
