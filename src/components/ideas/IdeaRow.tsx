import { useState } from 'react';
import type { IdeaMeta } from '../../db/schema';
import { db } from '../../db/schema';

interface Props {
  idea: IdeaMeta;
  onDelete: () => void;
  onArchive: () => void;
}

function formatDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
}

function formatStamp(ts: number): string {
  const d = new Date(ts);
  const day  = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${day} ${time.toLowerCase()}`;
}

export default function IdeaRow({ idea, onDelete }: Props) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isVoice = !idea.text && idea.durationMs != null;

  const handlePlay = async () => {
    if (audioUrl || loading) return;
    setLoading(true);
    try {
      const full = await db.ideas.get(idea.id);
      if (full?.audioBlob) {
        setAudioUrl(URL.createObjectURL(full.audioBlob));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-5 py-3 flex items-start gap-3">
      <span
        className="font-mono text-[11px] shrink-0 pt-1 select-none"
        style={{ color: 'var(--color-ink-3)' }}
      >
        {isVoice ? '◉' : '¶'}
      </span>

      <div className="flex-1 min-w-0">
        <p className="font-mono text-[10px] tracking-wider uppercase mb-1" style={{ color: 'var(--color-ink-3)' }}>
          {formatStamp(idea.createdAt)}
          {idea.durationMs ? ` · ${formatDuration(idea.durationMs)} voice` : ' · note'}
        </p>

        {idea.text && (
          <p className="font-serif text-base leading-snug" style={{ color: 'var(--color-ink)' }}>
            "{idea.text}"
          </p>
        )}

        {isVoice && !audioUrl && (
          <button
            onClick={handlePlay}
            disabled={loading}
            className="font-mono text-[10px] tracking-widest uppercase px-3 py-1 border border-hairline mt-1"
            style={{
              backgroundColor: 'var(--color-paper-2)',
              color: loading ? 'var(--color-ink-3)' : 'var(--color-ink)',
            }}
          >
            {loading ? '…' : '▶ Play'}
          </button>
        )}

        {audioUrl && (
          <audio
            src={audioUrl}
            controls
            autoPlay
            className="mt-1 w-full"
            style={{ height: '32px', colorScheme: 'light' }}
          />
        )}
      </div>

      <button
        onClick={onDelete}
        className="shrink-0 font-mono text-base leading-none pt-0.5"
        style={{ color: 'var(--color-ink-3)' }}
        aria-label="Delete idea"
      >
        ×
      </button>
    </div>
  );
}
