import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ConsumedItem } from '../../db/schema';
import { TYPE_META } from './typesMeta';

interface Props {
  item: ConsumedItem;
  onDelete: () => void;
}

function RatingPips({ value }: { value?: number }) {
  if (!value) return null;
  return (
    <span className="inline-flex gap-0.5 items-center">
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{
            backgroundColor: i <= value ? 'var(--color-accent)' : 'transparent',
            border: `1px solid ${i <= value ? 'var(--color-accent)' : 'var(--color-ink-3)'}`,
          }}
        />
      ))}
    </span>
  );
}

export default function ItemRow({ item, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);
  const meta = TYPE_META[item.type];
  const date = new Date(item.completedAt);
  const dateStr = date
    .toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    .toUpperCase();

  return (
    <div>
      <div
        className="flex items-start gap-3 px-5 py-3 cursor-pointer select-none"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Type abbr */}
        <span
          className="font-mono text-[9px] tracking-widest uppercase shrink-0 w-8 pt-1 text-right"
          style={{ color: 'var(--color-ink-3)' }}
        >
          {meta.abbr}
        </span>

        <div className="flex-1 min-w-0">
          <p
            className="font-serif text-base leading-snug"
            style={{
              color: 'var(--color-ink)',
              display: '-webkit-box',
              WebkitLineClamp: expanded ? undefined : 2,
              WebkitBoxOrient: 'vertical',
              overflow: expanded ? 'visible' : 'hidden',
            }}
          >
            {item.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="font-mono text-[10px] tracking-wider" style={{ color: 'var(--color-ink-3)' }}>
              {dateStr}
            </span>
            <RatingPips value={item.rating} />
          </div>
          {/* Note preview when collapsed */}
          {item.note && !expanded && (
            <p
              className="font-serif italic text-sm mt-0.5 line-clamp-1"
              style={{ color: 'var(--color-ink-2)' }}
            >
              {item.note}
            </p>
          )}
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-3" style={{ paddingLeft: 'calc(1.25rem + 2rem + 0.75rem)' }}>
              {item.note && (
                <p
                  className="font-serif italic text-sm leading-relaxed mb-2"
                  style={{
                    color: 'var(--color-ink-2)',
                    borderLeft: '1px solid var(--color-hairline)',
                    paddingLeft: '0.75rem',
                  }}
                >
                  {item.note}
                </p>
              )}
              {item.source && (
                <a
                  href={item.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="block font-mono text-[10px] tracking-wider uppercase mb-2"
                  style={{ color: 'var(--color-ink-3)' }}
                >
                  ↗ {item.source.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </a>
              )}
              <button
                onClick={e => { e.stopPropagation(); onDelete(); }}
                className="font-mono text-[10px] tracking-widest uppercase"
                style={{ color: 'var(--color-ink-3)' }}
              >
                Remove
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-5 border-b border-hairline" />
    </div>
  );
}
