export type Tab = 'today' | 'week' | 'ideas' | 'codex' | 'recap';

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const TABS: { id: Tab; numeral: string; label: string }[] = [
  { id: 'today', numeral: 'I',   label: 'Today' },
  { id: 'week',  numeral: 'II',  label: 'Week'  },
  { id: 'ideas', numeral: 'III', label: 'Ideas' },
  { id: 'codex', numeral: 'IV',  label: 'Codex' },
  { id: 'recap', numeral: 'V',   label: 'Recap' },
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
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-3 transition-colors"
          >
            <span
              className="font-mono text-[10px] font-semibold tracking-widest uppercase"
              style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-ink-3)' }}
            >
              {tab.numeral}
            </span>
            <span
              className="font-mono text-[9px] tracking-wider uppercase"
              style={{ color: isActive ? 'var(--color-ink-2)' : 'var(--color-ink-3)' }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
