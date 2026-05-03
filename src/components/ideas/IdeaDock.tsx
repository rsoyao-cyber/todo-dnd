import { useState, useRef, type KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioRecorder } from '../../lib/audio';

interface Props {
  onAddText:  (text: string) => void;
  onAddVoice: (blob: Blob, durationMs: number) => void;
}

function formatElapsed(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function IdeaDock({ onAddText, onAddVoice }: Props) {
  const [text, setText] = useState('');
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const recorderRef = useRef<AudioRecorder | null>(null);

  const submit = () => {
    if (!text.trim()) return;
    onAddText(text);
    setText('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit();
    if (e.key === 'Escape') setText('');
  };

  const toggleRecording = async () => {
    if (recording) {
      if (!recorderRef.current) return;
      const { blob, durationMs } = await recorderRef.current.stop();
      setRecording(false);
      setElapsed(0);
      recorderRef.current = null;
      onAddVoice(blob, durationMs);
    } else {
      try {
        const recorder = new AudioRecorder();
        recorder.onTick = ms => setElapsed(ms);
        await recorder.start();
        recorderRef.current = recorder;
        setRecording(true);
        setElapsed(0);
      } catch {
        alert('Microphone access denied.');
      }
    }
  };

  return (
    <div
      className="shrink-0 border-t border-hairline bg-paper-2"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {recording ? (
          <motion.div
            key="recording"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-3 px-5 py-3"
          >
            {/* Pulsing dot */}
            <motion.span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: 'var(--color-accent)' }}
              animate={{ opacity: [1, 0.25, 1] }}
              transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
            />
            <span
              className="flex-1 font-mono text-[11px] tracking-widest uppercase"
              style={{ color: 'var(--color-ink-2)' }}
            >
              {formatElapsed(elapsed)}
            </span>
            <button
              onClick={toggleRecording}
              className="font-mono text-[10px] tracking-widest uppercase px-3 py-1 border border-hairline"
              style={{ backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)' }}
            >
              Stop
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-3 px-5 py-3"
          >
            <input
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="A passing thought…"
              className="flex-1 bg-transparent outline-none font-serif text-base placeholder:italic"
              style={{ color: 'var(--color-ink)', caretColor: 'var(--color-accent)' }}
            />
            {text.trim() ? (
              <button
                onClick={submit}
                className="shrink-0 font-mono text-[10px] tracking-widest uppercase"
                style={{ color: 'var(--color-accent)' }}
              >
                Add
              </button>
            ) : (
              <button
                onClick={toggleRecording}
                className="shrink-0 font-mono text-base leading-none"
                style={{ color: 'var(--color-ink-3)' }}
                aria-label="Record voice note"
              >
                ◉
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
