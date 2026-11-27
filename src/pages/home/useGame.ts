import { useEffect, useMemo, useRef, useState } from 'react';
import { homeTeamMock, awayTeamMock } from '@/mocks/teams';

export type Side = 'home' | 'away';
export type ActionType =
  | 'FG3' | 'FG2' | 'FT' | 'FG3X' | 'FG2X' | 'FTX'
  | 'FOUL' | 'OREB' | 'DREB' | 'AST' | 'STL' | 'BLK' | 'TOV' | 'TIMEOUT';

export const ACTION_LABEL: Record<ActionType, string> = {
  FG3: '3分進', FG2: '2分進', FT: '罰球進', FG3X: '3分不進', FG2X: '2分不進', FTX: '罰球不進',
  FOUL: '犯規', OREB: '進攻籃板', DREB: '防守籃板', AST: '助攻', STL: '抄截', BLK: '火鍋', TOV: '失誤', TIMEOUT: '暫停',
};
export const POINTS: Partial<Record<ActionType, number>> = { FG3: 3, FG2: 2, FT: 1 };

export interface GameEvent {
  id: number;
  realTime: string;
  quarter: number;
  clock: string;
  side: Side;
  player: string;
  action: ActionType;
}

export interface PlayerStat {
  pts: number; fg3: number; fg3a: number; fg2: number; fg2a: number; ft: number; fta: number;
  foul: number; oreb: number; dreb: number; ast: number; stl: number; blk: number; tov: number;
}

export type TeamTheme = 'light' | 'dark';

export interface TeamConfig {
  name: string;
  theme: TeamTheme;
  players: string[];
}

const QUARTER_MS = 10 * 60 * 1000;
const ROSTER_KEY = 'bball-roster-v1';
const GAME_KEY = 'bball-game-v1';
const MAX_PLAYERS = 20;
export const MAX_ON_COURT = 5;

export const formatClock = (ms: number) => {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const t = Math.floor((ms % 1000) / 100);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${t}`;
};

export const formatPlayTime = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const emptyStat = (): PlayerStat => ({
  pts: 0, fg3: 0, fg3a: 0, fg2: 0, fg2a: 0, ft: 0, fta: 0, foul: 0, oreb: 0, dreb: 0, ast: 0, stl: 0, blk: 0, tov: 0,
});

const defaultTeams = (): Record<Side, TeamConfig> => ({
  home: { name: homeTeamMock.name, theme: 'light', players: [...homeTeamMock.players] },
  away: { name: awayTeamMock.name, theme: 'dark', players: [...awayTeamMock.players] },
});

const toTheme = (value: unknown, fallback: TeamTheme): TeamTheme => (value === 'light' || value === 'dark' ? value : fallback);

const loadTeams = (): Record<Side, TeamConfig> => {
  try {
    const raw = localStorage.getItem(ROSTER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<Side, TeamConfig>;
      if (parsed?.home?.players?.length && parsed?.away?.players?.length) {
        return {
          home: { name: parsed.home.name || homeTeamMock.name, theme: toTheme(parsed.home.theme, 'light'), players: parsed.home.players },
          away: { name: parsed.away.name || awayTeamMock.name, theme: toTheme(parsed.away.theme, 'dark'), players: parsed.away.players },
        };
      }
    }
  } catch {
    // 略過讀取失敗，改用預設名單
  }
  return defaultTeams();
};

interface SavedGame {
  events: GameEvent[];
  quarter: number;
  clockMs: number;
  onCourt: Record<Side, string[]>;
  playMs: Record<Side, Record<string, number>>;
}

const isAction = (value: unknown): value is ActionType => typeof value === 'string' && value in ACTION_LABEL;

const loadGame = (): SavedGame => {
  const fallback: SavedGame = {
    events: [], quarter: 1, clockMs: QUARTER_MS, onCourt: { home: [], away: [] }, playMs: { home: {}, away: {} },
  };
  try {
    const raw = localStorage.getItem(GAME_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<SavedGame>;
    const events = (Array.isArray(parsed.events) ? parsed.events : []).filter(
      (e) => !!e && typeof e.id === 'number' && isAction(e.action)
        && (e.side === 'home' || e.side === 'away') && typeof e.player === 'string',
    ) as GameEvent[];
    const clockMs = typeof parsed.clockMs === 'number' && Number.isFinite(parsed.clockMs)
      ? Math.max(0, Math.min(QUARTER_MS * 2, parsed.clockMs))
      : QUARTER_MS;
    const quarter = typeof parsed.quarter === 'number' && parsed.quarter >= 1 ? Math.floor(parsed.quarter) : 1;
    const sideData = (side: Side) => {
      const rawOnCourt = parsed.onCourt?.[side];
      const rawPlayMs = parsed.playMs?.[side];
      const onCourtList = Array.isArray(rawOnCourt)
        ? rawOnCourt.filter((p) => typeof p === 'string').slice(0, MAX_ON_COURT)
        : [];
      const msMap: Record<string, number> = {};
      if (rawPlayMs && typeof rawPlayMs === 'object') {
        Object.entries(rawPlayMs).forEach(([key, value]) => {
          if (typeof value === 'number' && Number.isFinite(value) && value >= 0) msMap[key] = value;
        });
      }
      return { onCourtList, msMap };
    };
    const home = sideData('home');
    const away = sideData('away');
    return {
      events,
      quarter,
      clockMs,
      onCourt: { home: home.onCourtList, away: away.onCourtList },
      playMs: { home: home.msMap, away: away.msMap },
    };
  } catch {
    return fallback;
  }
};

export default function useGame() {
  const [saved] = useState<SavedGame>(loadGame);
  const [teams, setTeams] = useState<Record<Side, TeamConfig>>(loadTeams);
  const [events, setEvents] = useState<GameEvent[]>(saved.events);
  const [selected, setSelected] = useState<{ side: Side; player: string } | null>(null);
  const [clockMs, setClockMs] = useState(saved.clockMs);
  const [running, setRunning] = useState(false);
  const [quarter, setQuarter] = useState(saved.quarter);
  const [onCourt, setOnCourt] = useState<Record<Side, string[]>>(saved.onCourt);
  const [playMs, setPlayMs] = useState<Record<Side, Record<string, number>>>(saved.playMs);
  const idRef = useRef(saved.events.reduce((max, e) => Math.max(max, e.id), 0) + 1);
  const onCourtRef = useRef(onCourt);

  useEffect(() => {
    onCourtRef.current = onCourt;
  }, [onCourt]);

  useEffect(() => {
    try {
      localStorage.setItem(ROSTER_KEY, JSON.stringify(teams));
    } catch {
      // 忽略儲存失敗
    }
  }, [teams]);

  useEffect(() => {
    setOnCourt((prev) => ({
      home: prev.home.filter((p) => teams.home.players.includes(p)),
      away: prev.away.filter((p) => teams.away.players.includes(p)),
    }));
  }, [teams]);

  const snapshotRef = useRef<SavedGame>({ events, quarter, clockMs, onCourt, playMs });
  snapshotRef.current = { events, quarter, clockMs, onCourt, playMs };

  useEffect(() => {
    const save = () => {
      try {
        localStorage.setItem(GAME_KEY, JSON.stringify(snapshotRef.current));
      } catch {
        // 忽略儲存失敗
      }
    };
    const timer = setInterval(save, 1000);
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') save();
    };
    window.addEventListener('beforeunload', save);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearInterval(timer);
      save();
      window.removeEventListener('beforeunload', save);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  useEffect(() => {
    if (!running) return undefined;
    let last = Date.now();
    const timer = setInterval(() => {
      const now = Date.now();
      const diff = now - last;
      last = now;
      setClockMs((c) => Math.max(0, c - diff));
      setPlayMs((prev) => {
        const sides: Side[] = ['home', 'away'];
        let changed = false;
        const next = { ...prev };
        sides.forEach((side) => {
          const list = onCourtRef.current[side];
          if (!list.length) return;
          const copy = { ...(next[side] ?? {}) };
          list.forEach((p) => { copy[p] = (copy[p] ?? 0) + diff; });
          next[side] = copy;
          changed = true;
        });
        return changed ? next : prev;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (running && clockMs <= 0) setRunning(false);
  }, [running, clockMs]);

  const record = (action: ActionType, sideOverride?: Side) => {
    const side = sideOverride ?? selected?.side;
    if (!side) return false;
    const player = action === 'TIMEOUT' ? '團隊' : selected?.player;
    if (!player) return false;
    setEvents((prev) => [{
      id: idRef.current++,
      realTime: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
      quarter,
      clock: formatClock(clockMs),
      side,
      player,
      action,
    }, ...prev]);
    if (action === 'TIMEOUT') setRunning(false);
    return true;
  };

  const undo = () => setEvents((prev) => prev.slice(1));
  const removeEvent = (id: number) => setEvents((prev) => prev.filter((e) => e.id !== id));

  const stats = useMemo(() => {
    const result: Record<Side, Record<string, PlayerStat>> = { home: {}, away: {} };
    (['home', 'away'] as Side[]).forEach((s) => {
      teams[s].players.forEach((p) => { result[s][p] = emptyStat(); });
      result[s]['團隊'] = emptyStat();
    });
    events.forEach((e) => {
      const st = result[e.side][e.player] ?? emptyStat();
      result[e.side][e.player] = st;
      switch (e.action) {
        case 'FG3': st.fg3 += 1; st.fg3a += 1; st.pts += 3; break;
        case 'FG2': st.fg2 += 1; st.fg2a += 1; st.pts += 2; break;
        case 'FT': st.ft += 1; st.fta += 1; st.pts += 1; break;
        case 'FG3X': st.fg3a += 1; break;
        case 'FG2X': st.fg2a += 1; break;
        case 'FTX': st.fta += 1; break;
        case 'FOUL': st.foul += 1; break;
        case 'OREB': st.oreb += 1; break;
        case 'DREB': st.dreb += 1; break;
        case 'AST': st.ast += 1; break;
        case 'STL': st.stl += 1; break;
        case 'BLK': st.blk += 1; break;
        case 'TOV': st.tov += 1; break;
        default: break;
      }
    });
    return result;
  }, [events, teams]);

  const summary = useMemo(() => {
    const make = (side: Side) => {
      const list = events.filter((e) => e.side === side);
      return {
        score: list.reduce((sum, e) => sum + (POINTS[e.action] ?? 0), 0),
        fouls: list.filter((e) => e.action === 'FOUL').length,
        quarterFouls: list.filter((e) => e.action === 'FOUL' && e.quarter === quarter).length,
        timeouts: list.filter((e) => e.action === 'TIMEOUT').length,
      };
    };
    return { home: make('home'), away: make('away') };
  }, [events, quarter]);

  const toggleOnCourt = (side: Side, player: string): boolean => {
    const list = onCourt[side];
    if (!list.includes(player) && list.length >= MAX_ON_COURT) return false;
    setOnCourt((prev) => {
      const current = prev[side];
      if (current.includes(player)) {
        return { ...prev, [side]: current.filter((p) => p !== player) };
      }
      if (current.length >= MAX_ON_COURT) return prev;
      return { ...prev, [side]: [...current, player] };
    });
    return true;
  };

  const isOnCourt = (side: Side, player: string) => onCourt[side].includes(player);
  const playerMs = (side: Side, player: string) => playMs[side]?.[player] ?? 0;

  const updateTeamName = (side: Side, name: string) => {
    setTeams((prev) => ({ ...prev, [side]: { ...prev[side], name } }));
  };

  const updateTeamTheme = (side: Side, theme: TeamTheme) => {
    setTeams((prev) => ({ ...prev, [side]: { ...prev[side], theme } }));
  };

  const addPlayer = (side: Side, raw: string) => {
    const num = raw.trim();
    if (!num) return false;
    if (teams[side].players.includes(num)) return false;
    if (teams[side].players.length >= MAX_PLAYERS) return false;
    setTeams((prev) => ({ ...prev, [side]: { ...prev[side], players: [...prev[side].players, num] } }));
    return true;
  };

  const removePlayer = (side: Side, player: string) => {
    setTeams((prev) => ({ ...prev, [side]: { ...prev[side], players: prev[side].players.filter((p) => p !== player) } }));
    setOnCourt((prev) => ({ ...prev, [side]: prev[side].filter((p) => p !== player) }));
    setPlayMs((prev) => {
      const current = prev[side] ?? {};
      if (!(player in current)) return prev;
      const copy = { ...current };
      delete copy[player];
      return { ...prev, [side]: copy };
    });
    setSelected((prev) => (prev && prev.side === side && prev.player === player ? null : prev));
  };

  const updatePlayerNumber = (side: Side, oldNum: string, raw: string) => {
    const next = raw.trim();
    if (!next || next === oldNum) return false;
    if (teams[side].players.includes(next)) return false;
    setTeams((prev) => ({
      ...prev,
      [side]: { ...prev[side], players: prev[side].players.map((p) => (p === oldNum ? next : p)) },
    }));
    setEvents((prev) => prev.map((e) => (e.side === side && e.player === oldNum ? { ...e, player: next } : e)));
    setPlayMs((prev) => {
      const current = prev[side] ?? {};
      if (!(oldNum in current)) return prev;
      const copy = { ...current, [next]: current[oldNum] ?? 0 };
      delete copy[oldNum];
      return { ...prev, [side]: copy };
    });
    setOnCourt((prev) => ({ ...prev, [side]: prev[side].map((p) => (p === oldNum ? next : p)) }));
    setSelected((prev) => (prev && prev.side === side && prev.player === oldNum ? { side, player: next } : prev));
    return true;
  };

  const adjustClock = (delta: number) => setClockMs((c) => Math.max(0, Math.min(QUARTER_MS * 2, c + delta)));
  const resetClock = () => { setRunning(false); setClockMs(QUARTER_MS); };
  const changeQuarter = (q: number) => { setRunning(false); setQuarter(Math.max(1, q)); setClockMs(QUARTER_MS); };
  const resetGame = () => {
    resetClock();
    setQuarter(1);
    setEvents([]);
    setSelected(null);
    setPlayMs({ home: {}, away: {} });
    setOnCourt({ home: [], away: [] });
  };

  return {
    teams, events, selected, setSelected, clockMs, running, setRunning, quarter,
    record, undo, removeEvent, stats, summary, adjustClock, resetClock, changeQuarter, resetGame,
    onCourt, toggleOnCourt, isOnCourt, playMs, playerMs,
    updateTeamName, updateTeamTheme, addPlayer, removePlayer, updatePlayerNumber,
  };
}

export type GameApi = ReturnType<typeof useGame>;