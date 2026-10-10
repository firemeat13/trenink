import { actions, useData } from '../store';
import { navigate } from '../router';
import { exercisesOfType, sortSessionsDesc, typeName } from '../selectors';
import { TYPE_ACCENT, card } from '../theme';
import { EXERCISE_FORMS, formatDate, plural } from '../utils';
import type { TypeId } from '../types';

export default function Home() {
  const d = useData();
  const active = d.sessions.filter((s) => s.status === 'active').sort(sortSessionsDesc);
  const done = d.sessions.filter((s) => s.status === 'done').sort(sortSessionsDesc);

  const start = (typeId: TypeId) => navigate(`/trenink/${actions.startSession(typeId)}`);

  return (
    <div className="space-y-4 p-4 pt-[calc(1rem+env(safe-area-inset-top))]">
      <h1 className="text-2xl font-bold">Tréninkový deník</h1>

      {active.map((s) => (
        <button
          key={s.id}
          onClick={() => navigate(`/trenink/${s.id}`)}
          className="w-full rounded-2xl border-2 border-amber-400 bg-amber-50 p-4 text-left active:bg-amber-100 dark:border-amber-500/70 dark:bg-amber-950/40 dark:active:bg-amber-950"
        >
          <div className="text-sm font-semibold text-amber-800 dark:text-amber-300">Rozpracovaný trénink</div>
          <div className="text-lg font-bold">Pokračovat: {typeName(d, s.typeId)}</div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">{formatDate(s.date)}</div>
        </button>
      ))}

      <div className="grid grid-cols-1 gap-3">
        {d.types.map((t) => {
          const last = done.find((s) => s.typeId === t.id);
          const count = exercisesOfType(d, t.id).length;
          const isActive = active.some((s) => s.typeId === t.id);
          return (
            <button
              key={t.id}
              onClick={() => start(t.id)}
              className={`${card} flex min-h-24 items-stretch overflow-hidden text-left active:scale-[0.98] active:opacity-90 transition`}
            >
              <span className={`w-2 shrink-0 ${TYPE_ACCENT[t.id].bar}`} />
              <span className="flex flex-1 flex-col justify-center px-4 py-3">
                <span className="text-2xl font-bold">{t.name}</span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {plural(count, EXERCISE_FORMS)}
                  {' · '}
                  {isActive ? 'rozpracováno' : last ? `naposledy ${formatDate(last.date)}` : 'zatím necvičeno'}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <a
        href="#/historie"
        className={`${card} flex h-14 items-center justify-between px-4 font-semibold text-blue-600 dark:text-blue-400`}
      >
        Historie tréninků <span aria-hidden>→</span>
      </a>
    </div>
  );
}
