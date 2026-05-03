import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIdeas } from '../hooks/useIdeas';
import IdeaRow from '../components/ideas/IdeaRow';
import IdeaDock from '../components/ideas/IdeaDock';
import WeeklyReview from './WeeklyReview';

export default function Ideas() {
  const { ideasThisWeek, addTextIdea, addVoiceIdea, archiveIdea, deleteIdea } = useIdeas();
  const [reviewOpen, setReviewOpen] = useState(false);

  const ideas = ideasThisWeek();

  if (reviewOpen) {
    return <WeeklyReview onClose={() => setReviewOpen(false)} />;
  }

  return (
    <div className="flex flex-col h-full">
      <header className="shrink-0 px-5 pt-12 pb-4 border-b border-hairline flex items-end justify-between">
        <div>
          <p className="font-mono text-[11px] tracking-widest uppercase" style={{ color: 'var(--color-ink-3)' }}>
            {ideas.length} held · capture inbox
          </p>
          <h1 className="font-serif text-3xl mt-0.5" style={{ color: 'var(--color-ink)' }}>
            Ideas
          </h1>
        </div>
        <button
          onClick={() => setReviewOpen(true)}
          className="font-mono text-[10px] tracking-widest uppercase pb-1"
          style={{ color: 'var(--color-ink-3)' }}
        >
          Review week
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        {ideas.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-5 py-8 font-serif italic text-base"
            style={{ color: 'var(--color-ink-3)' }}
          >
            A passing thought…
          </motion.p>
        )}

        <AnimatePresence>
          {ideas.map((idea, i) => (
            <motion.div
              key={idea.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{
                opacity: { duration: 0.25, delay: i * 0.03 },
                y:       { duration: 0.25, delay: i * 0.03 },
                height:  { duration: 0.14 },
              }}
            >
              <IdeaRow
                idea={idea}
                onDelete={() => deleteIdea(idea.id)}
                onArchive={() => archiveIdea(idea.id)}
              />
              <div className="mx-5 border-b border-hairline" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <IdeaDock onAddText={addTextIdea} onAddVoice={addVoiceIdea} />
    </div>
  );
}
