import { useState } from 'react';
import useGame from '@/pages/home/useGame';
import Scoreboard from '@/pages/home/components/Scoreboard';
import PlayerColumn from '@/pages/home/components/PlayerColumn';
import ActionPad from '@/pages/home/components/ActionPad';
import StatsPanel from '@/pages/home/components/StatsPanel';
import RosterSettings from '@/pages/home/components/RosterSettings';

export default function Home() {
  const g = useGame();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background-50">
      <Scoreboard g={g} onOpenSettings={() => setSettingsOpen(true)} />
      <main className="px-4 md:px-6 py-4">
        <h1 className="sr-only">籃球比賽計分工具</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_220px] gap-4">
          <PlayerColumn g={g} side="home" />
          <ActionPad g={g} />
          <PlayerColumn g={g} side="away" />
        </div>
        <StatsPanel g={g} />
      </main>
      {settingsOpen && <RosterSettings g={g} onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}