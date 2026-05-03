import { Sprite } from '../sprites/Sprite';
import type { SpriteName } from '../sprites/sprites';

export type Tab = 'today' | 'week' | 'ideas' | 'codex' | 'recap';

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const TABS: { id: Tab; numeral: string; label: string; glyph: SpriteName }[] = [
  { id: 'today', numeral: 'I',   label: 'Today', glyph: 'sword'  },
  { id: 'week',  numeral: 'II',  label: 'Week',  glyph: 'shield' },
  { id: 'ideas', numeral: 'III', label: 'Ideas', glyph: 'lantern'},
  { id: 'codex', numeral: 'IV',  label: 'Codex', glyph: 'book'   },
  { id: 'recap', numeral: 'V',   label: 'Recap', glyph: 'scroll' },
];

export default function TabBar({ active, onChange }: Props) {
  return (
    <nav
      className="shrink-0 flex border-t border-hairline bg-paper-2"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {TABS.map(tab => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors"
          >
            <Sprite
              name={tab.glyph}
              size={20}
              color={isActive ? 'var(--color-accent)' : 'var(--color-ink-3)'}
              accent={isActive ? 'var(--color-accent)' : 'var(--color-ink-3)'}
            />
            <span
              className="font-mono text-[9px] tracking-wider uppercase"
              style={{ color: isActive ? 'var(--color-ink-2)' : 'var(--color-ink-3)' }}
            >
              {tab.label}
            </span>
            <span
              className="font-mono text-[8px] tracking-widest"
              style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-ink-3)', opacity: 0.8 }}
            >
              {tab.numeral}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
