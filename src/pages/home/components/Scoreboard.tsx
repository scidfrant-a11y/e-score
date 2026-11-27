import { formatClock, GameApi, Side } from '@/pages/home/useGame';
import { exportStats } from '@/pages/home/exportCsv';

const TeamScore = ({ g, side }: { g: GameApi; side: Side }) => {
  const s = g.summary[side];
  const bonus = s.quarterFouls >= 5;
  return (
    <div className={`flex flex-col ${side === 'home' ? 'items-start' : 'items-end'} min-w-0`}>
      <span className="text-xs md:text-sm text-foreground-700 truncate max-w-full">{g.teams[side].name}</span>
      <span className="font-heading text-5xl md:text-6xl font-bold text-foreground-950 tabular-nums">{s.score}</span>
      <div className="flex flex-wrap gap-2 text-xs mt-1">
        <span className="px-2 py-0.5 rounded-full bg-secondary-100 text-secondary-900">暫停 {s.timeouts}</span>
        <span className={`px-2 py-0.5 rounded-full ${bonus ? 'bg-primary-500 text-background-50' : 'bg-accent-100 text-accent-900'}`}>
          本節團犯 {s.quarterFouls}{bonus ? ' 加罰' : ''}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-background-200 text-foreground-700">總犯 {s.fouls}</span>
      </div>
      <button type="button" onClick={() => g.record('TIMEOUT', side)} className="mt-2 text-xs px-3 py-1 rounded-md border border-secondary-300 text-secondary-700 hover:bg-secondary-100 whitespace-nowrap cursor-pointer">
        <i className="ri-pause-circle-line mr-1" />喊暫停
      </button>
    </div>
  );
};

const SmallBtn = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button type="button" onClick={onClick} className="px-2 py-1 text-xs rounded-md bg-background-100 border border-background-300 hover:bg-background-200 whitespace-nowrap cursor-pointer">
    {label}
  </button>
);

export default function Scoreboard({ g, onOpenSettings }: { g: GameApi; onOpenSettings: () => void }) {
  return (
    <header className="bg-background-100 border-b border-background-200 px-4 md:px-6 py-4">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
        <TeamScore g={g} side="home" />
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => g.changeQuarter(g.quarter - 1)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-background-200 cursor-pointer"><i className="ri-arrow-left-s-line" /></button>
            <span className="text-sm font-label px-3 py-0.5 rounded-full bg-accent-500 text-background-50">{g.quarter <= 4 ? `第 ${g.quarter} 節` : `延長 ${g.quarter - 4}`}</span>
            <button type="button" onClick={() => g.changeQuarter(g.quarter + 1)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-background-200 cursor-pointer"><i className="ri-arrow-right-s-line" /></button>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => g.setRunning(!g.running)} className={`w-12 h-12 flex items-center justify-center rounded-full text-background-50 cursor-pointer ${g.running ? 'bg-secondary-500 hover:bg-secondary-600' : 'bg-primary-500 hover:bg-primary-600'}`}>
              <i className={`text-xl ${g.running ? 'ri-pause-fill' : 'ri-play-fill'}`} />
            </button>
            <span className={`font-heading text-5xl md:text-6xl tabular-nums ${g.clockMs < 60000 ? 'text-primary-600' : 'text-foreground-950'}`}>{formatClock(g.clockMs)}</span>
            <button type="button" onClick={g.resetClock} title="重置時間" className="w-12 h-12 flex items-center justify-center rounded-full bg-background-200 hover:bg-background-300 cursor-pointer">
              <i className="ri-restart-line text-xl" />
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-1">
            <SmallBtn label="-1分" onClick={() => g.adjustClock(-60000)} />
            <SmallBtn label="-1秒" onClick={() => g.adjustClock(-1000)} />
            <SmallBtn label="-0.1" onClick={() => g.adjustClock(-100)} />
            <SmallBtn label="+0.1" onClick={() => g.adjustClock(100)} />
            <SmallBtn label="+1秒" onClick={() => g.adjustClock(1000)} />
            <SmallBtn label="+1分" onClick={() => g.adjustClock(60000)} />
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" onClick={onOpenSettings} className="text-xs px-3 py-1.5 rounded-md bg-secondary-500 text-background-50 hover:bg-secondary-600 whitespace-nowrap cursor-pointer"><i className="ri-team-line mr-1" />名單設定</button>
            <button type="button" onClick={() => exportStats(g)} className="text-xs px-3 py-1.5 rounded-md bg-accent-500 text-background-50 hover:bg-accent-600 whitespace-nowrap cursor-pointer"><i className="ri-download-2-line mr-1" />匯出數據</button>
            <button type="button" onClick={() => { if (window.confirm('確定要重置整場比賽？')) g.resetGame(); }} className="text-xs px-3 py-1.5 rounded-md border border-background-300 hover:bg-background-200 whitespace-nowrap cursor-pointer"><i className="ri-delete-bin-line mr-1" />重置比賽</button>
          </div>
        </div>
        <TeamScore g={g} side="away" />
      </div>
    </header>
  );
}