import type { ConsumedItem } from '../../db/schema';
import { Sprite } from '../sprites/Sprite';
import { TYPE_META, TYPE_ORDER } from './typesMeta';

export type TypeFilter = ConsumedItem['type'] | null;

interface Props {
  value: TypeFilter;
  onChange: (v: TypeFilter) => void;
}

export default function FilterChips({ value, onChange }: Props) {
  return (
    <div
      className="flex gap-2 overflow-x-auto px-5 py-2 shrink-0"
      style={{ scrollbarWidth: 'none' }}
    >
      <button
        onClick={() => onChange(null)}
        className="shrink-0 font-mono text-[10px] tracking-widest uppercase px-2 py-1 border transition-colors"
        style={{
          borderColor:     value === null ? 'var(--color-accent)' : 'var(--color-hairline)',
          color:           value === null ? 'var(--color-accent)' : 'var(--color-ink-3)',
          backgroundColor: 'var(--color-paper)',
        }}
      >
        All
      </button>
      {TYPE_ORDER.map(type => {
        const active = value === type;
        const meta   = TYPE_META[type];
        return (
          <button
            key={type}
            onClick={() => onChange(type)}
            className="shrink-0 flex items-center gap-1 font-mono text-[10px] tracking-widest uppercase px-2 py-1 border transition-colors"
            style={{
              borderColor:     active ? 'var(--color-accent)' : 'var(--color-hairline)',
              color:           active ? 'var(--color-accent)' : 'var(--color-ink-3)',
              backgroundColor: 'var(--color-paper)',
            }}
          >
            <Sprite
              name={meta.glyph}
              size={11}
              color={active ? 'var(--color-accent)' : 'var(--color-ink-3)'}
              accent={active ? 'var(--color-accent)' : 'var(--color-ink-3)'}
            />
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}
