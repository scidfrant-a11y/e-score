import { useState } from 'react';
import { ACTION_LABEL, formatPlayTime, GameApi, Side } from '@/pages/home/useGame';

const heads = ['背號', '上場', '得分', '3分', '2分', '罰球', '進板', '防板', '助攻', '抄截', '火鍋', '失誤', '犯規'];

export default function StatsPanel({ g }: { g: GameApi }) {
  const [tab, setTab] = useState<'log' | Side>('home');
  const tabs: { k: 'log' | Side; l: string }[] = [
    { k: 'home', l: g.teams.home.name }, { k: 'away', l: g.teams.away.name }, { k: 'log', l: '動作紀錄' },
  ];
  return (
    <section className="bg-background-100 rounded-lg p-4 mt-4">
      <div className="inline-flex flex-wrap gap-1 px-1 py-1 rounded-full bg-background-200 mb-3">
        {tabs.map((t) => (
          <button key={t.k} type="button" onClick={() => setTab(t.k)} className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap cursor-pointer ${tab === t.k ? 'bg-primary-500 text-background-50' : 'text-foreground-700'}`}>{t.l}</button>
        ))}
      </div>
      <div className="overflow-x-auto">
        {tab === 'log' ? (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-foreground-600 border-b border-background-300">
              {['實際時間', '節', '比賽時間', '球隊', '背號', '動作', '操作'].map((h) => <th key={h} className="py-2 pr-3 font-medium">{h}</th>)}
            </tr></thead>
            <tbody>
              {g.events.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-foreground-500">尚無紀錄</td></tr>}
              {g.events.map((e) => (
                <tr key={e.id} className="border-b border-background-200">
                  <td className="py-2 pr-3">{e.realTime}</td>
                  <td className="pr-3">{e.quarter}</td>
                  <td className="pr-3 tabular-nums">{e.clock}</td>
                  <td className="pr-3">{g.teams[e.side].name}</td>
                  <td className="pr-3">{e.player}</td>
                  <td className="pr-3"><span className="px-2 py-0.5 rounded-full bg-secondary-100 text-secondary-900 text-xs">{ACTION_LABEL[e.action]}</span></td>
                  <td><button type="button" onClick={() => g.removeEvent(e.id)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-background-200 cursor-pointer"><i className="ri-delete-bin-line" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-foreground-600 border-b border-background-300">
              {heads.map((h) => <th key={h} className="py-2 pr-3 font-medium whitespace-nowrap">{h}</th>)}
            </tr></thead>
            <tbody>
              {Object.entries(g.stats[tab]).map(([p, s]) => (
                <tr key={p} className="border-b border-background-200 tabular-nums">
                  <td className="py-2 pr-3 font-heading">{p}</td>
                  <td className="pr-3 whitespace-nowrap text-foreground-700">
                    {g.isOnCourt(tab, p) ? <span className="text-primary-700 font-semibold">{formatPlayTime(g.playerMs(tab, p))}</span> : (g.playerMs(tab, p) > 0 ? formatPlayTime(g.playerMs(tab, p)) : <span className="text-foreground-500">-</span>)}
                  </td>
                  <td className="pr-3 font-bold text-primary-700">{s.pts}</td>
                  <td className="pr-3">{s.fg3}/{s.fg3a}</td>
                  <td className="pr-3">{s.fg2}/{s.fg2a}</td>
                  <td className="pr-3">{s.ft}/{s.fta}</td>
                  <td className="pr-3">{s.oreb}</td>
                  <td className="pr-3">{s.dreb}</td>
                  <td className="pr-3">{s.ast}</td>
                  <td className="pr-3">{s.stl}</td>
                  <td className="pr-3">{s.blk}</td>
                  <td className="pr-3">{s.tov}</td>
                  <td className={s.foul >= 5 ? 'text-primary-600 font-bold' : ''}>{s.foul}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}