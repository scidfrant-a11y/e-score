import { useState } from 'react';
import { formatPlayTime, GameApi, MAX_ON_COURT, Side } from '@/pages/home/useGame';

export default function PlayerColumn({ g, side }: { g: GameApi; side: Side }) {
  const isDark = g.teams[side].theme === 'dark';
  const players = g.teams[side].players;
  const onCount = g.onCourt[side].length;
  const [notice, setNotice] = useState('');

  const teamActive = g.selected?.side === side && g.selected.player === '團隊';
  const full = onCount >= MAX_ON_COURT;

  return (
    <aside className="bg-background-100 rounded-lg p-3 flex flex-col gap-3 lg:max-h-[820px] lg:overflow-y-auto">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground-950 truncate">{g.teams[side].name}</p>
          <p className="text-[11px] text-foreground-600">{side === 'home' ? '主隊' : '客隊'} · {isDark ? '深色' : '淺色'}</p>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-accent-100 text-accent-900 whitespace-nowrap">
          場上 {onCount}/{MAX_ON_COURT}
        </span>
      </div>
      {notice && (
        <p className="text-[11px] text-primary-700 leading-tight -mt-1">{notice}</p>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => { setNotice(''); g.setSelected({ side, player: '團隊' }); }}
          className={`rounded-lg p-2 flex flex-col items-center justify-center gap-1 min-h-[104px] cursor-pointer border-2 transition-all ${
            teamActive ? 'border-primary-500' : 'border-transparent'
          } ${isDark ? 'bg-foreground-800 text-background-50' : 'bg-background-200 text-foreground-950'}`}
        >
          <i className="ri-team-line text-xl" />
          <span className="text-[11px] font-label">團隊</span>
          <span className="text-[10px] opacity-70">{g.summary[side].fouls} 犯</span>
        </button>

        {players.map((p) => {
          const st = g.stats[side][p];
          const active = g.selected?.side === side && g.selected.player === p;
          const onCourt = g.isOnCourt(side, p);
          const ms = g.playerMs(side, p);
          const played = ms > 0;
          const fouled = (st?.foul ?? 0) >= 5;
          return (
            <div
              key={p}
              className={`relative rounded-lg p-1.5 flex flex-col items-center gap-1 border transition-all ${
                onCourt
                  ? isDark ? 'bg-foreground-800 border-accent-400' : 'bg-background-200 border-accent-300'
                  : isDark ? 'bg-foreground-900 border-foreground-700' : 'bg-background-50 border-background-200'
              } ${fouled ? 'opacity-50' : ''}`}
            >
              <button
                type="button"
                onClick={() => { setNotice(''); g.setSelected({ side, player: p }); }}
                className={`w-[58px] h-[58px] rounded-full flex flex-col items-center justify-center cursor-pointer border-2 transition-all ${
                  active ? 'border-primary-500 scale-105' : 'border-transparent'
                } ${isDark ? 'bg-foreground-800 text-background-50' : 'bg-background-300 text-foreground-950'}`}
              >
                <span className="font-heading text-lg leading-none">{p}</span>
                <span className="text-[9px] opacity-80 mt-0.5 whitespace-nowrap">{st?.pts ?? 0}分 · {st?.foul ?? 0}犯</span>
              </button>
              <span className={`text-[10px] tabular-nums whitespace-nowrap ${onCourt ? 'text-primary-700 font-semibold' : 'text-foreground-600'}`}>
                {played ? formatPlayTime(ms) : '未上場'}
              </span>
              <button
                type="button"
                onClick={() => (g.toggleOnCourt(side, p) ? setNotice('') : setNotice(`場上最多 ${MAX_ON_COURT} 人，請先讓一位球員下場`))}
                title={!onCourt && full ? `場上已滿 ${MAX_ON_COURT} 人` : onCourt ? '下場' : '上場'}
                className={`w-full text-[10px] py-0.5 rounded-md whitespace-nowrap cursor-pointer transition-colors ${
                  onCourt
                    ? 'bg-accent-500 text-background-50 hover:bg-accent-600'
                    : full
                      ? 'bg-background-200 text-foreground-500 hover:bg-background-300'
                      : 'bg-background-200 text-foreground-700 hover:bg-background-300'
                }`}
              >
                {onCourt ? '下場' : '上場'}
              </button>
            </div>
          );
        })}
      </div>

      {players.length === 0 && (
        <p className="text-[11px] text-foreground-600 leading-relaxed rounded-md bg-background-50 border border-dashed border-background-300 px-3 py-4 text-center">
          名單尚無球員，請到「名單設定」新增背號。
        </p>
      )}

      <p className="mt-auto text-[10px] text-foreground-500 leading-tight flex items-center gap-1">
        <i className="ri-lock-line" />
        球員增減請至上方「名單設定」，避免比賽中誤觸
      </p>
    </aside>
  );
}