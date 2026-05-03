import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useConsumedItems } from '../hooks/useConsumedItems';
import ItemRow from '../components/library/ItemRow';
import FilterChips, { type TypeFilter } from '../components/library/FilterChips';
import QuickAddModal from '../components/library/QuickAddModal';
import { getWeekId, getWeekNumber, getWeekDateRange } from '../lib/weekId';
import type { ConsumedItem } from '../db/schema';

type SubTab = 'this-week' | 'earlier';

// Group earlier items by weekId, newest week first
function groupByWeek(items: ConsumedItem[]): { weekId: string; items: ConsumedItem[] }[] {
  const map = new Map<string, ConsumedItem[]>();
  for (const item of items) {
    if (!map.has(item.weekId)) map.set(item.weekId, []);
    map.get(item.weekId)!.push(item);
  }
  return [...map.entries()]
    .sort(([a], [b]) => (a > b ? -1 : 1))
    .map(([weekId, items]) => ({ weekId, items }));
}

export default function Library() {
  const { thisWeekItems, earlierItems, addItem, deleteItem } = useConsumedItems();
  const [subTab,     setSubTab]     = useState<SubTab>('this-week');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(null);
  const [addOpen,    setAddOpen]    = useState(false);

  const weekId     = getWeekId();
  const weekNum    = getWeekNumber(weekId);
  const dateRange  = getWeekDateRange(weekId);
  const totalCount = thisWeekItems.length + earlierItems.length;

  const filteredEarlier = typeFilter
    ? earlierItems.filter(i => i.type === typeFilter)
    : earlierItems;

  const weekGroups = groupByWeek(filteredEarlier);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="shrink-0 px-5 pt-12 pb-4 border-b border-hairline">
        <p className="font-mono text-[11px] tracking-widest uppercase" style={{ color: 'var(--color-ink-3)' }}>
          Week {weekNum} · {dateRange}
          {thisWeekItems.length > 0 && ` · ${thisWeekItems.length} logged`}
        </p>
        <h1 className="font-serif text-3xl mt-0.5" style={{ color: 'var(--color-ink)' }}>
          Codex
        </h1>

        {/* Sub-tabs */}
        <div className="flex gap-5 mt-3">
          {(['this-week', 'earlier'] as SubTab[]).map(tab => {
            if (tab === 'earlier' && totalCount === 0) return null;
            const active = subTab === tab;
            const label  = tab === 'this-week' ? 'This chapter' : 'Earlier';
            const count  = tab === 'this-week' ? thisWeekItems.length : earlierItems.length;
            return (
              <button
                key={tab}
                onClick={() => setSubTab(tab)}
                className="flex items-center gap-1.5 pb-1 border-b-2 transition-colors"
                style={{
                  borderColor: active ? 'var(--color-accent)' : 'transparent',
                  color:       active ? 'var(--color-ink)'    : 'var(--color-ink-3)',
                }}
              >
                <span className="font-mono text-[11px] tracking-widest uppercase">{label}</span>
                <span className="font-mono text-[10px]" style={{ color: 'var(--color-ink-3)' }}>
                  {String(count).padStart(2, '0')}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Filter chips — Earlier only */}
      {subTab === 'earlier' && (
        <FilterChips value={typeFilter} onChange={setTypeFilter} />
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {subTab === 'this-week' && (
          <>
            {thisWeekItems.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-5 py-8 font-serif italic text-base"
                style={{ color: 'var(--color-ink-3)' }}
              >
                {totalCount === 0
                  ? 'The Codex is empty. The first entry is the hardest.'
                  : 'This chapter is unwritten. What did you take in?'}
              </motion.p>
            ) : (
              <AnimatePresence>
                {thisWeekItems.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ opacity: { duration: 0.22, delay: i * 0.03 }, height: { duration: 0.14 } }}
                  >
                    <ItemRow item={item} onDelete={() => deleteItem(item.id)} />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </>
        )}

        {subTab === 'earlier' && (
          <>
            {weekGroups.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-5 py-8 font-serif italic text-base"
                style={{ color: 'var(--color-ink-3)' }}
              >
                {typeFilter
                  ? 'Nothing of that kind, this chapter.'
                  : 'Earlier chapters fade into the unwritten.'}
              </motion.p>
            ) : (
              <>
                {weekGroups.map(({ weekId: wId, items }) => (
                  <div key={wId}>
                    <div className="flex items-center gap-3 px-5 py-2 border-b border-hairline">
                      <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: 'var(--color-ink-3)' }}>
                        Week {getWeekNumber(wId)} · {getWeekDateRange(wId)}
                      </span>
                      <span className="font-mono text-[10px]" style={{ color: 'var(--color-ink-3)' }}>
                        {String(items.length).padStart(2, '0')}
                      </span>
                    </div>
                    {items.map(item => (
                      <ItemRow key={item.id} item={item} onDelete={() => deleteItem(item.id)} />
                    ))}
                  </div>
                ))}
                <p className="px-5 py-8 text-center font-serif italic text-sm" style={{ color: 'var(--color-ink-3)' }}>
                  Earlier chapters fade into the unwritten.
                </p>
              </>
            )}
          </>
        )}
      </div>

      {/* Floating + button */}
      <button
        onClick={() => setAddOpen(true)}
        className="fixed bottom-20 right-5 w-12 h-12 flex items-center justify-center border border-hairline font-mono text-2xl"
        style={{
          backgroundColor: 'var(--color-paper-2)',
          color:           'var(--color-ink)',
          bottom: 'calc(env(safe-area-inset-bottom) + 5rem)',
        }}
        aria-label="Log something you took in"
      >
        +
      </button>

      {/* Quick-Add modal */}
      <AnimatePresence>
        {addOpen && (
          <QuickAddModal
            onAdd={addItem}
            onClose={() => setAddOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
