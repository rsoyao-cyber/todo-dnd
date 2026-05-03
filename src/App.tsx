import { useState } from 'react';
import TabBar from './components/shared/TabBar';
import Today from './screens/Today';
import Week from './screens/Week';
import Ideas from './screens/Ideas';

type Tab = 'today' | 'week' | 'ideas';

export default function App() {
  const [tab, setTab] = useState<Tab>('today');

  return (
    <div className="flex flex-col bg-paper" style={{ height: '100dvh' }}>
      <div className="flex-1 overflow-hidden">
        {tab === 'today' && <Today />}
        {tab === 'week'  && <Week />}
        {tab === 'ideas' && <Ideas />}
      </div>
      <TabBar active={tab} onChange={setTab} />
    </div>
  );
}
