import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useRecap } from '../hooks/useRecap';
import { db } from '../db/schema';
import type { Task, IdeaMeta } from '../db/schema';
import { getWeekNumber, getWeekDateRange } from '../lib/weekId';
import { dropTask, snoozeTask } from '../lib/nudges';
import { TYPE_META } from '../components/library/typesMeta';
import { Sprite } from '../components/sprites/Sprite';
import type { SpriteName } from '../components/sprites/sprites';
import { Fleuron } from '../components/shared/Fleuron';

// ── Animation ──────────────────────────────────────────────────────────────
const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

function Section({ index, glyph, numeral, title, children }: {
  index: number; glyph: SpriteName; numeral: string; title: string; children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.54, delay: index * 0.08, ease }}
      className="px-5 py-5 border-b border-hairline"
    >
      <div className="flex items-center gap-2 mb-3">
        <Sprite name={glyph} size={22} color="var(--color-accent)" accent="var(--color-accent)" />
        <span
          className="font-serif italic text-xl"
          style={{ color: 'var(--color-accent)', lineHeight: 1 }}
        >
          {numeral}.
        </span>
        <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: 'var(--color-ink-3)' }}>
          {title}
        </span>
      </div>
      {children}
    </motion.section>
  );
}

// ── Lazy audio player for voice ideas ─────────────────────────────────────
function VoiceIdeaPlayer({ idea }: { idea: IdeaMeta }) {
  const [url, setUrl]         = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePlay = async () => {
    if (url || loading) return;
    setLoading(true);
    try {
      const full = await db.ideas.get(idea.id);
      if (full?.audioBlob) setUrl(URL.createObjectURL(full.audioBlob));
    } finally { setLoading(false); }
  };

  const s   = idea.durationMs ? Math.round(idea.durationMs / 1000) : 0;
  const dur = s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;

  if (url) {
    return <audio src={url} controls autoPlay className="w-full mt-1" style={{ height: 32 }} />;
  }
  return (
    <button
      onClick={handlePlay}
      className="font-mono text-[10px] tracking-widest uppercase px-2 py-1 border border-hairline mt-1"
      style={{ backgroundColor: 'var(--color-paper-2)', color: loading ? 'var(--color-ink-3)' : 'var(--color-ink)' }}
    >
      {loading ? '…' : `▶ ${dur}`}
    </button>
  );
}

// ── Carried-forward task row with inline actions ───────────────────────────
function CarriedRow({ task, onActed }: { task: Task; onActed: (id: string) => void }) {
  const [done, setDone] = useState(false);
  if (done) return null;

  const act = async (fn: () => Promise<void>) => { await fn(); setDone(true); onActed(task.id); };

  return (
    <div className="mb-3">
      <p className="font-serif text-base leading-snug mb-1.5" style={{ color: 'var(--color-ink-2)' }}>
        {task.title}
      </p>
      <div className="flex gap-2">
        {(['Keep', 'Snooze 3d', 'Drop'] as const).map(label => (
          <button
            key={label}
            onClick={() => {
              if (label === 'Keep')      act(async () => { /* acknowledged */ });
              if (label === 'Snooze 3d') act(() => snoozeTask(task.id, 3));
              if (label === 'Drop')      act(() => dropTask(task.id));
            }}
            className="font-mono text-[9px] tracking-widest uppercase px-2 py-1 border border-hairline"
            style={{ color: 'var(--color-ink-3)', backgroundColor: 'var(--color-paper-2)' }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Reflection textarea — syncs to weekId changes, debounced save ──────────
function ReflectionArea({ value, weekId, onSave }: {
  value?: string; weekId: string; onSave: (t: string) => Promise<void>;
}) {
  const [text, setText] = useState(value ?? '');
  const timerRef        = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Re-sync when navigating to a different week
  useEffect(() => { setText(value ?? ''); }, [weekId, value]);

  const handleChange = (t: string) => {
    setText(t);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onSave(t), 800);
  };

  return (
    <textarea
      value={text}
      onChange={e => handleChange(e.target.value)}
      onBlur={() => { clearTimeout(timerRef.current); onSave(text); }}
      placeholder="What do you want to carry into next week?"
      rows={5}
      className="w-full border border-hairline px-4 py-3 font-serif text-base resize-none outline-none placeholder:italic"
      style={{
        backgroundColor: 'var(--color-paper-2)',
        color:           'var(--color-ink)',
        caretColor:      'var(--color-accent)',
      }}
    />
  );
}

// ── Screen ─────────────────────────────────────────────────────────────────
export default function Recap({ onGoToToday }: { onGoToToday: () => void }) {
  const [offset, setOffset] = useState(-1);
  const [dismissed, setDismissed] = useState(new Set<string>());

  const {
    weekId, completedTasks, capturedIdeas, carriedForwardTasks,
    consumedItems, synthesisText, reflection, saveReflection,
  } = useRecap(offset);

  // Reset dismissed list when switching weeks
  useEffect(() => { setDismissed(new Set()); }, [weekId]);

  const activeTasks = carriedForwardTasks.filter(t => !dismissed.has(t.id));
  const weekNum     = getWeekNumber(weekId);
  const dateRange   = getWeekDateRange(weekId);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.54, ease }}
          className="px-5 pt-12 pb-5 text-center border-b border-hairline"
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() => setOffset(o => o - 1)}
              className="font-mono text-[11px] tracking-widest uppercase"
              style={{ color: 'var(--color-ink-3)' }}
            >
              ‹ Prev
            </button>
            <div>
              <p className="font-mono text-[10px] tracking-widest uppercase" style={{ color: 'var(--color-ink-3)' }}>
                Week {weekNum} · {dateRange}
              </p>
              <h1 className="font-serif italic text-2xl mt-1" style={{ color: 'var(--color-ink)' }}>
                The week that was
              </h1>
              <div className="mt-3 flex justify-center">
                <Fleuron color="var(--color-hairline)" w={80} />
              </div>
            </div>
            <button
              onClick={() => setOffset(o => Math.min(o + 1, -1))}
              className="font-mono text-[11px] tracking-widest uppercase"
              style={{
                color:         offset < -1 ? 'var(--color-ink-3)' : 'transparent',
                pointerEvents: offset < -1 ? 'auto' : 'none',
              }}
            >
              Next ›
            </button>
          </div>
        </motion.div>

        {/* ── I. Closed ── */}
        <Section index={0} glyph="sword" numeral="I" title="Closed">
          {completedTasks.length === 0 ? (
            <p className="font-serif italic text-base" style={{ color: 'var(--color-ink-3)' }}>
              A quiet week for finishing things.
            </p>
          ) : (
            <>
              <p className="font-mono text-[10px] tracking-widest uppercase mb-3" style={{ color: 'var(--color-ink-3)' }}>
                {completedTasks.length} task{completedTasks.length !== 1 ? 's' : ''}
              </p>
              <div className="flex flex-wrap gap-2">
                {completedTasks.map(t => (
                  <span
                    key={t.id}
                    className="font-serif text-sm px-2 py-1 border border-hairline"
                    style={{ backgroundColor: 'var(--color-paper-3)', color: 'var(--color-ink-2)' }}
                  >
                    {t.title}
                  </span>
                ))}
              </div>
            </>
          )}
        </Section>

        {/* ── II. What landed ── */}
        <Section index={1} glyph="crown" numeral="II" title="What landed">
          {synthesisText ? (
            <>
              <p className="font-mono text-[10px] tracking-widest uppercase mb-2" style={{ color: 'var(--color-ink-3)' }}>
                The piece that mattered most
              </p>
              <p
                className="font-serif text-base leading-relaxed"
                style={{
                  color:       'var(--color-ink-2)',
                  borderLeft:  '1px solid var(--color-hairline)',
                  paddingLeft: '0.75rem',
                }}
              >
                {synthesisText}
              </p>
            </>
          ) : (
            <p className="font-serif italic text-base" style={{ color: 'var(--color-ink-3)' }}>
              No synthesis written for this week.
            </p>
          )}
        </Section>

        {/* ── III. What you took in ── */}
        <Section index={2} glyph="book" numeral="III" title="What you took in">
          {consumedItems.length === 0 ? (
            <p className="font-serif italic text-base" style={{ color: 'var(--color-ink-3)' }}>
              A quiet week for taking in. That's a real thing too.
            </p>
          ) : (
            <>
              <p className="font-mono text-[10px] tracking-widest uppercase mb-3" style={{ color: 'var(--color-ink-3)' }}>
                {consumedItems.length} logged
              </p>
              <div className="flex flex-col gap-2">
                {consumedItems.map(item => (
                  <div key={item.id} className="flex items-baseline gap-2">
                    <span className="font-mono text-[9px] tracking-wider uppercase shrink-0 w-8" style={{ color: 'var(--color-ink-3)' }}>
                      {TYPE_META[item.type].abbr}
                    </span>
                    <span className="font-serif text-base leading-snug" style={{ color: 'var(--color-ink-2)' }}>
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Section>

        {/* ── IV. Ideas captured ── */}
        <Section index={3} glyph="lantern" numeral="IV" title="Ideas captured">
          {capturedIdeas.length === 0 ? (
            <p className="font-serif italic text-base" style={{ color: 'var(--color-ink-3)' }}>
              Nothing held this week.
            </p>
          ) : (
            <>
              <p className="font-mono text-[10px] tracking-widest uppercase mb-3" style={{ color: 'var(--color-ink-3)' }}>
                {capturedIdeas.length} held
              </p>
              <div className="flex flex-col gap-3">
                {capturedIdeas.map(idea => (
                  <div key={idea.id}>
                    {idea.text && (
                      <p className="font-serif text-base leading-snug" style={{ color: 'var(--color-ink-2)' }}>
                        ¶ "{idea.text}"
                      </p>
                    )}
                    {!idea.text && idea.durationMs != null && (
                      <div>
                        <p className="font-mono text-[10px] tracking-wider uppercase mb-0.5" style={{ color: 'var(--color-ink-3)' }}>
                          ◉ Voice
                        </p>
                        <VoiceIdeaPlayer idea={idea} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </Section>

        {/* ── V. Carried forward ── */}
        <Section index={4} glyph="compass" numeral="V" title="Carried forward">
          {activeTasks.length === 0 ? (
            <p className="font-serif italic text-base" style={{ color: 'var(--color-ink-3)' }}>
              {carriedForwardTasks.length === 0
                ? 'Everything from this week is closed.'
                : 'All carried tasks have been addressed.'}
            </p>
          ) : (
            <>
              <p className="font-mono text-[10px] tracking-widest uppercase mb-3" style={{ color: 'var(--color-ink-3)' }}>
                {activeTasks.length} still open
              </p>
              {activeTasks.map(t => (
                <CarriedRow
                  key={t.id}
                  task={t}
                  onActed={id => setDismissed(prev => new Set([...prev, id]))}
                />
              ))}
            </>
          )}
        </Section>

        {/* ── VI. A note ── */}
        <Section index={5} glyph="eye" numeral="VI" title="A note">
          <ReflectionArea
            value={reflection}
            weekId={weekId}
            onSave={saveReflection}
          />
        </Section>

        {/* ── Footer ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ duration: 0.54, ease }}
          className="px-5 py-10 flex flex-col items-center gap-4"
        >
          <div className="flex items-center justify-center gap-3">
            <Sprite name="coin"   size={22} color="var(--color-accent)" accent="var(--color-accent)" />
            <Sprite name="key"    size={22} color="var(--color-accent)" accent="var(--color-accent)" />
            <Sprite name="potion" size={22} color="var(--color-accent)" accent="var(--color-accent)" />
            <Sprite name="star"   size={22} color="var(--color-accent)" accent="var(--color-accent)" />
          </div>
          <Fleuron color="var(--color-hairline)" w={80} />
          <p className="font-serif italic text-xl" style={{ color: 'var(--color-ink-3)' }}>
            Onward.
          </p>
          <button
            onClick={onGoToToday}
            className="mt-1 font-mono text-[11px] tracking-widest uppercase px-5 py-3 border border-hairline"
            style={{ backgroundColor: 'var(--color-paper-2)', color: 'var(--color-ink)' }}
          >
            Back to today ›
          </button>
        </motion.div>

      </div>
    </div>
  );
}
