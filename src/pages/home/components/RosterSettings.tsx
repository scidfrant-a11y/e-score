import { useState } from 'react';
import { GameApi, Side } from '@/pages/home/useGame';

function TeamEditor({ g, side }: { g: GameApi; side: Side }) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const team = g.teams[side];
  const isHome = side === 'home';
  const isDark = team.theme === 'dark';

  const handleAdd = () => {
    const num = draft.trim();
    if (!num) {
      setError('請輸入背號');
      return;
    }
    if (team.players.includes(num)) {
      setError('這個背號已經有人了');
      return;
    }
    if (team.players.length >= 20) {
      setError('最多 20 位球員');
      return;
    }
    g.addPlayer(side, num);
    setDraft('');
    setError('');
  };

  return (
    <div className="rounded-lg bg-background-50 border border-background-200 p-3 flex flex-col gap-3 min-w-0">
      <div className="flex items-center gap-2">
        <span className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-[11px] ${isDark ? 'bg-foreground-900 text-background-50' : 'bg-background-300 text-foreground-950'}`}>
          {isHome ? '主' : '客'}
        </span>
        <span className="text-sm font-semibold text-foreground-950 truncate">{team.name || (isHome ? '主場' : '客場')}</span>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-background-200 text-foreground-700 whitespace-nowrap">
          {isHome ? '主場' : '客場'} · {isDark ? '深色' : '淺色'}
        </span>
      </div>

      <div>
        <label className="text-xs text-foreground-600" htmlFor={`team-name-${side}`}>隊名</label>
        <input
          id={`team-name-${side}`}
          name={`teamName-${side}`}
          value={team.name}
          maxLength={16}
          onChange={(e) => g.updateTeamName(side, e.target.value)}
          className="mt-1 w-full text-sm px-3 py-2 rounded-md bg-background-50 border border-background-300 focus:outline-none focus:ring-2 focus:ring-primary-400"
          placeholder="輸入隊名"
        />
      </div>

      <div>
        <p className="text-xs text-foreground-600 mb-1.5">配色</p>
        <div className="inline-flex gap-1 p-1 rounded-full bg-background-200">
          {(['light', 'dark'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => g.updateTeamTheme(side, t)}
              aria-pressed={team.theme === t}
              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap cursor-pointer transition-colors ${team.theme === t ? (t === 'dark' ? 'bg-foreground-900 text-background-50' : 'bg-background-50 text-foreground-950') : 'text-foreground-700 hover:text-foreground-950'}`}
            >
              <i className={`mr-1 ${t === 'dark' ? 'ri-moon-line' : 'ri-sun-line'}`} />{t === 'dark' ? '深色' : '淺色'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-foreground-600 mb-1.5">背號名單（{team.players.length}/20 人，可直接改數字）</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {team.players.map((p) => (
            <div key={p} className="flex items-center gap-1 min-w-0">
              <input
                defaultValue={p}
                maxLength={3}
                inputMode="numeric"
                aria-label={`${team.name} 背號 ${p}`}
                onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                onBlur={(e) => {
                  const ok = g.updatePlayerNumber(side, p, e.target.value);
                  if (!ok) e.target.value = p;
                }}
                className="w-full min-w-0 text-center text-sm px-2 py-1.5 rounded-md bg-background-50 border border-background-300 tabular-nums focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
              <button
                type="button"
                onClick={() => g.removePlayer(side, p)}
                aria-label={`移除背號 ${p}`}
                title="移除"
                className="w-7 h-7 shrink-0 flex items-center justify-center rounded-md text-foreground-600 hover:bg-background-200 hover:text-primary-700 cursor-pointer"
              >
                <i className="ri-close-line text-sm" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => { setDraft(e.target.value); setError(''); }}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
          maxLength={3}
          inputMode="numeric"
          placeholder="新增背號"
          className="w-full min-w-0 text-sm px-3 py-1.5 rounded-md bg-background-50 border border-background-300 focus:outline-none focus:ring-2 focus:ring-primary-400"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={team.players.length >= 20}
          className="shrink-0 text-xs px-3 py-2 rounded-md bg-primary-500 text-background-50 hover:bg-primary-600 whitespace-nowrap cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <i className="ri-add-line mr-1" />新增
        </button>
      </div>
      {error && <p className="text-[11px] text-primary-700">{error}</p>}
    </div>
  );
}

export default function RosterSettings({ g, onClose }: { g: GameApi; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <div className="absolute inset-0 bg-foreground-950/50" onClick={onClose} role="presentation" />
      <div className="relative w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-lg bg-background-100 border border-background-200 p-4 md:p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-semibold text-foreground-950">名單設定</h2>
            <p className="text-xs text-foreground-600 mt-0.5">修改隊名、配色與背號後會自動儲存，重新整理也不會消失。改背號時該球員的數據與上場時間會一起移轉。</p>
            <p className="text-xs text-foreground-600 mt-1">球員的新增與移除只能在這裡操作，計分畫面上不會出現增減按鈕，避免比賽中誤觸。</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉名單設定"
            className="w-8 h-8 shrink-0 flex items-center justify-center rounded-md hover:bg-background-200 cursor-pointer"
          >
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <TeamEditor g={g} side="home" />
          <TeamEditor g={g} side="away" />
        </div>

        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={onClose}
            className="text-sm px-4 py-2 rounded-md bg-primary-500 text-background-50 hover:bg-primary-600 whitespace-nowrap cursor-pointer"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
}