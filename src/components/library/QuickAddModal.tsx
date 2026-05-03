import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ConsumedItem } from '../../db/schema';
import { Sprite } from '../sprites/Sprite';
import { TYPE_META, TYPE_ORDER } from './typesMeta';
import { getWeekId, getWeekNumber } from '../../lib/weekId';

interface Props {
  onAdd:   (draft: { title: string; type: ConsumedItem['type']; rating?: ConsumedItem['rating']; note?: string; source?: string }) => Promise<void>;
  onClose: () => void;
}

// Sparkle positions for the two reward bursts
const BURST_1 = [{ x: -10, y: -10 }, { x: 10, y: -10 }, { x: -10, y: 10 }, { x: 10, y: 10 }];
const BURST_2 = [{ x: -17, y: -17 }, { x: 17, y: -17 }, { x: -17, y: 17 }, { x: 17, y: 17 }];

function RatingInput({ value, onChange }: { value?: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(value === i ? 0 : i)}
          className="w-5 h-5 rounded-full border transition-colors"
          style={{
            backgroundColor: value && i <= value ? 'var(--color-accent)' : 'transparent',
            borderColor:     value && i <= value ? 'var(--color-accent)' : 'var(--color-ink-3)',
          }}
          aria-label={`${i} star${i !== 1 ? 's' : ''}`}
        />
      ))}
    </div>
  );
}

export default function QuickAddModal({ onAdd, onClose }: Props) {
  const [type,           setType]           = useState<ConsumedItem['type'] | null>(null);
  const [title,          setTitle]          = useState('');
  const [rating,         setRating]         = useState<number>(0);
  const [note,           setNote]           = useState('');
  const [source,         setSource]         = useState('');
  const [showOptional,   setShowOptional]   = useState(false);
  const [phase,          setPhase]          = useState<'form' | 'reward'>('form');

  const titleRef = useRef<HTMLInputElement>(null);

  // Autofocus title when modal opens
  useEffect(() => {
    const t = setTimeout(() => titleRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, []);

  const canSubmit = !!type && title.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit || !type) return;
    await onAdd({
      title: title.trim(),
      type,
      rating: rating > 0 ? (rating as ConsumedItem['rating']) : undefined,
      note:   note.trim() || undefined,
      source: source.trim() || undefined,
    });
    setPhase('reward');
    setTimeout(onClose, 720);
  };

  const weekId  = getWeekId();
  const weekNum = getWeekNumber(weekId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ backgroundColor: 'rgba(44,36,24,0.35)' }}
      onClick={onClose}
    >
      {/* Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        className="relative flex flex-col border-t border-hairline overflow-hidden"
        style={{
          backgroundColor: 'var(--color-paper-2)',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)',
          maxHeight: '90dvh',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Form ── */}
        <motion.div
          animate={{ opacity: phase === 'reward' ? 0.25 : 1 }}
          transition={{ duration: 0.12 }}
          className="flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-5 pt-5 pb-4 border-b border-hairline">
            <p className="font-mono text-[10px] tracking-widest uppercase" style={{ color: 'var(--color-ink-3)' }}>
              Add to the Codex
            </p>
            <p className="font-serif italic text-base mt-0.5" style={{ color: 'var(--color-ink-2)' }}>
              What did you just finish?
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
            {/* Type picker */}
            <div className="grid grid-cols-6 gap-1.5">
              {TYPE_ORDER.map(t => {
                const active = type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className="flex flex-col items-center gap-1 py-2 border transition-colors"
                    style={{
                      borderWidth:     active ? '2px' : '1px',
                      borderColor:     active ? 'var(--color-accent)' : 'var(--color-hairline)',
                      backgroundColor: active ? 'var(--color-paper-3)' : 'var(--color-paper)',
                    }}
                  >
                    <Sprite
                      name={TYPE_META[t].glyph}
                      size={20}
                      color={active ? 'var(--color-accent)' : 'var(--color-ink)'}
                      accent="var(--color-accent)"
                    />
                    <span
                      className="font-mono text-[9px] tracking-wider uppercase"
                      style={{ color: active ? 'var(--color-accent)' : 'var(--color-ink-3)' }}
                    >
                      {TYPE_META[t].label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Title */}
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && canSubmit) handleSubmit(); }}
              placeholder="Title…"
              className="w-full bg-paper border border-hairline px-4 py-3 font-serif text-base outline-none placeholder:italic"
              style={{ color: 'var(--color-ink)', caretColor: 'var(--color-accent)' }}
            />

            {/* Optional reveal toggle */}
            <button
              type="button"
              onClick={() => setShowOptional(v => !v)}
              className="font-mono text-[10px] tracking-widest uppercase text-left"
              style={{ color: 'var(--color-ink-3)' }}
            >
              {showOptional ? '− Hide optional fields' : '+ Add a note, rating, or link'}
            </button>

            {/* Optional fields */}
            <AnimatePresence>
              {showOptional && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden flex flex-col gap-3"
                >
                  <RatingInput value={rating} onChange={setRating} />

                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value.slice(0, 240))}
                    placeholder="What did it leave with you?"
                    rows={3}
                    maxLength={240}
                    className="w-full bg-paper border border-hairline px-4 py-3 font-serif text-sm resize-none outline-none placeholder:italic"
                    style={{ color: 'var(--color-ink)', caretColor: 'var(--color-accent)' }}
                  />

                  <input
                    type="url"
                    value={source}
                    onChange={e => setSource(e.target.value)}
                    placeholder="https://… (optional)"
                    className="w-full bg-paper border border-hairline px-4 py-3 font-mono text-sm outline-none placeholder:not-italic"
                    style={{ color: 'var(--color-ink)', caretColor: 'var(--color-accent)' }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CTA row */}
          <div className="flex border-t border-hairline shrink-0">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex-1 py-4 font-mono text-[11px] tracking-widest uppercase transition-opacity"
              style={{
                backgroundColor: canSubmit ? 'var(--color-accent)' : 'var(--color-paper-3)',
                color:           canSubmit ? '#F4ECD8' : 'var(--color-ink-3)',
                opacity:         canSubmit ? 1 : 0.5,
              }}
            >
              Inscribe it
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-4 font-mono text-[11px] tracking-widest uppercase border-l border-hairline"
              style={{ color: 'var(--color-ink-3)' }}
            >
              Cancel
            </button>
          </div>
        </motion.div>

        {/* ── Reward overlay ── */}
        <AnimatePresence>
          {phase === 'reward' && type && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.08 }}
            >
              {/* Type sprite */}
              <div className="relative flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: [0.4, 1.15, 1], opacity: 1 }}
                  transition={{ duration: 0.32, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  <Sprite
                    name={TYPE_META[type].glyph}
                    size={72}
                    color="var(--color-accent)"
                    accent="var(--color-accent)"
                  />
                </motion.div>

                {/* Burst 1 — accent-clay */}
                {BURST_1.map((pos, i) => (
                  <motion.span
                    key={`b1-${i}`}
                    className="absolute w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: 'var(--color-accent)' }}
                    initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                    animate={{ x: pos.x, y: pos.y, opacity: [0, 1, 0], scale: [0, 1, 0] }}
                    transition={{ delay: 0.16, duration: 0.28, ease: 'easeOut' }}
                  />
                ))}

                {/* Burst 2 — gold */}
                {BURST_2.map((pos, i) => (
                  <motion.span
                    key={`b2-${i}`}
                    className="absolute w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: 'var(--color-gold)' }}
                    initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                    animate={{ x: pos.x, y: pos.y, opacity: [0, 1, 0], scale: [0, 1, 0] }}
                    transition={{ delay: 0.24, duration: 0.28, ease: 'easeOut' }}
                  />
                ))}
              </div>

              {/* Stamp */}
              <motion.p
                className="font-mono text-[11px] tracking-widest uppercase mt-4"
                style={{ color: 'var(--color-ink-2)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.12 }}
              >
                Inscribed · Week {weekNum}
              </motion.p>

              {/* Lyrical line */}
              <motion.p
                className="font-serif italic text-base mt-1"
                style={{ color: 'var(--color-ink-3)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.54, duration: 0.16 }}
              >
                One more for the chapter.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
