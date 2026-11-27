import { ACTION_LABEL, formatPlayTime, GameApi } from '@/pages/home/useGame';

const download = (name: string, rows: (string | number)[][]) => {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};

const pct = (m: number, a: number) => (a ? `${Math.round((m / a) * 100)}%` : '-');

export const exportStats = (g: GameApi) => {
  const rows: (string | number)[][] = [
    ['比賽', `${g.teams.home.name} ${g.summary.home.score} : ${g.summary.away.score} ${g.teams.away.name}`],
    [],
    ['球隊', '背號', '上場時間', '得分', '3分', '3分%', '2分', '2分%', '罰球', '罰球%', '進攻籃板', '防守籃板', '助攻', '抄截', '火鍋', '失誤', '犯規'],
  ];
  (['home', 'away'] as const).forEach((side) => {
    Object.entries(g.stats[side]).forEach(([p, s]) => {
      rows.push([g.teams[side].name, p, formatPlayTime(g.playerMs(side, p)), s.pts, `${s.fg3}/${s.fg3a}`, pct(s.fg3, s.fg3a), `${s.fg2}/${s.fg2a}`, pct(s.fg2, s.fg2a),
        `${s.ft}/${s.fta}`, pct(s.ft, s.fta), s.oreb, s.dreb, s.ast, s.stl, s.blk, s.tov, s.foul]);
    });
  });
  rows.push([], ['實際時間', '節', '比賽時間', '球隊', '背號', '動作']);
  [...g.events].reverse().forEach((e) => {
    rows.push([e.realTime, e.quarter, e.clock, g.teams[e.side].name, e.player, ACTION_LABEL[e.action]]);
  });
  download(`比賽數據_${new Date().toISOString().slice(0, 10)}.csv`, rows);
};