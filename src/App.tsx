import { useState } from 'react';
import TabBar from './components/shared/TabBar';
import NudgeBanner from './components/NudgeBanner';
import Today from './screens/Today';
import Week from './screens/Week';
import Ideas from './screens/Ideas';
import Settings from './screens/Settings';

type Tab = 'today' | 'week' | 'ideas';

function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.5 1h3l.5 1.8a5.5 5.5 0 0 1 1.3.75l1.8-.6 1.5 2.6-1.4 1.2a5.6 5.6 0 0 1 0 1.5l1.4 1.2-1.5 2.6-1.8-.6a5.5 5.5 0 0 1-1.3.75L10.5 14h-3l-.5-1.8A5.5 5.5 0 0 1 5.7 11.45l-1.8.6L2.4 9.45l1.4-1.2a5.6 5.6 0 0 1 0-1.5L2.4 5.55l1.5-2.6 1.8.6A5.5 5.5 0 0 1 7 2.8L7.5 1ZM9 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>('today');
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="flex flex-col bg-paper" style={{ height: '100dvh' }}>
      <div className="flex-1 overflow-hidden flex flex-col">
        {settingsOpen ? (
          <Settings onClose={() => setSettingsOpen(false)} />
        ) : (
          <>
            <NudgeBanner onGoToToday={() => setTab('today')} />
            <div className="flex-1 overflow-hidden">
              {tab === 'today' && <Today />}
              {tab === 'week'  && <Week />}
              {tab === 'ideas' && <Ideas />}
            </div>
          </>
        )}
      </div>

      {!settingsOpen && <TabBar active={tab} onChange={setTab} />}

      {!settingsOpen && (
        <button
          onClick={() => setSettingsOpen(true)}
          className="fixed top-0 right-0 p-4 transition-opacity"
          style={{
            paddingTop: 'calc(env(safe-area-inset-top) + 1rem)',
            color: 'var(--color-ink-3)',
          }}
          aria-label="Settings"
        >
          <GearIcon />
        </button>
      )}
    </div>
  );
}
