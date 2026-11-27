import { ActionType, GameApi } from '@/pages/home/useGame';

const groups: { title: string; items: { a: ActionType; label: string; tone: string }[] }[] = [
  { title: '得分', items: [
    { a: 'FG3', label: '+3 進', tone: 'bg-primary-500 text-background-50 hover:bg-primary-600' },
    { a: 'FG2', label: '+2 進', tone: 'bg-primary-500 text-background-50 hover:bg-primary-600' },
    { a: 'FT', label: '+1 罰進', tone: 'bg-primary-500 text-background-50 hover:bg-primary-600' },
  ] },
  { title: '未得分', items: [
    { a: 'FG3X', label: '3 不進', tone: 'bg-primary-100 text-primary-900 hover:bg-primary-200' },
    { a: 'FG2X', label: '2 不進', tone: 'bg-primary-100 text-primary-900 hover:bg-primary-200' },
    { a: 'FTX', label: '罰不進', tone: 'bg-primary-100 text-primary-900 hover:bg-primary-200' },
  ] },
  { title: '籃板', items: [
    { a: 'OREB', label: '進攻籃板', tone: 'bg-accent-100 text-accent-900 hover:bg-accent-200' },
    { a: 'DREB', label: '防守籃板', tone: 'bg-accent-100 text-accent-900 hover:bg-accent-200' },
  ] },
  { title: '其他', items: [
    { a: 'AST', label: '助攻', tone: 'bg-secondary-100 text-secondary-900 hover:bg-secondary-200' },
    { a: 'STL', label: '抄截', tone: 'bg-secondary-100 text-secondary-900 hover:bg-secondary-200' },
    { a: 'BLK', label: '火鍋', tone: 'bg-secondary-100 text-secondary-900 hover:bg-secondary-200' },
    { a: 'TOV', label: '失誤', tone: 'bg-secondary-100 text-secondary-900 hover:bg-secondary-200' },
  ] },
  { title: '犯規', items: [
    { a: 'FOUL', label: '犯規', tone: 'bg-secondary-500 text-background-50 hover:bg-secondary-600' },
  ] },
];

export default function ActionPad({ g }: { g: GameApi }) {
  const sel = g.selected;
  const disabled = !sel || sel.player === '團隊';
  return (
    <section className="bg-background-100 rounded-lg p-4 flex flex-col gap-4">
      <div className="text-center text-sm">
        {sel ? (
          <span>已選：<strong className="text-primary-700">{g.teams[sel.side].name} #{sel.player}</strong></span>
        ) : <span className="text-foreground-600">請先點選左右兩側的球員背號</span>}
      </div>
      {groups.map((grp) => (
        <div key={grp.title}>
          <p className="text-xs text-foreground-600 mb-1.5">{grp.title}</p>
          <div className="grid grid-cols-3 gap-2">
            {grp.items.map((it) => {
              const off = disabled && !(it.a === 'FOUL' && sel?.player === '團隊');
              return (
                <button
                  key={it.a}
                  type="button"
                  disabled={off}
                  onClick={() => g.record(it.a)}
                  className={`py-2.5 rounded-md text-sm font-label whitespace-nowrap cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${it.tone}`}
                >
                  {it.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <button type="button" onClick={g.undo} disabled={!g.events.length} className="py-2.5 rounded-md text-sm border border-primary-300 text-primary-700 hover:bg-primary-50 whitespace-nowrap cursor-pointer disabled:opacity-40">
        <i className="ri-arrow-go-back-line mr-1" />上一步
      </button>
    </section>
  );
}