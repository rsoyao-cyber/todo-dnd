import { useState, type KeyboardEvent } from 'react';

interface Props {
  onAdd: (title: string) => void;
  placeholder?: string;
}

export default function AddTaskInput({ onAdd, placeholder = 'Inscribe a task…' }: Props) {
  const [value, setValue] = useState('');

  const submit = () => {
    if (!value.trim()) return;
    onAdd(value);
    setValue('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit();
    if (e.key === 'Escape') setValue('');
  };

  return (
    <div
      className="shrink-0 flex items-center gap-3 px-5 py-3 border-t border-hairline bg-paper-2"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}
    >
      <span className="text-base shrink-0" style={{ color: 'var(--color-ink-3)' }}>+</span>
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none font-serif text-base placeholder:italic"
        style={{
          color: 'var(--color-ink)',
          caretColor: 'var(--color-accent)',
        }}
      />
      {value.trim() && (
        <button
          onClick={submit}
          className="shrink-0 font-mono text-[10px] tracking-widest uppercase px-2 py-1"
          style={{ color: 'var(--color-accent)' }}
        >
          Add
        </button>
      )}
    </div>
  );
}
