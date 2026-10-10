import { useState } from 'react';
import { useData } from '../store';
import { sortSessionsDesc, typeName } from '../selectors';
import Header from '../components/Header';
import { TYPE_ACCENT, card } from '../theme';
import { EXERCISE_FORMS, SERIES_FORMS, formatDate, plural } from '../utils';
import type { TypeId } from '../types';

export default function History() {
  const d = useData();
  const [filter, setFilter] = useState<TypeId | 'all'>('all');

  const sessions = d.sessions.filter((s) => filter === 'all' || s.typeId === filter).sort(sortSessionsDesc);

  const chip = (active: boolean) =>
    `h-10 shrink-0 rounded-full px-4 text-sm font-semibold ${
      active ? 'bg-blue-600 text-white dark:bg-blue-500' : 'bg-white text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'
    }`;

  return (
    <>
      <Header title="Historie" />
      <div className="flex gap-2 overflow-x-auto px-3 pt-3 pb-1">
        <button className={chip(filter === 'all')} onClick={() => setFilter('all')}>
          Vše
        </button>
        {d.types.map((t) => (
          <button key={t.id} className={chip(filter === t.id)} onClick={() => setFilter(t.id)}>
            {t.name}
          </button>
        ))}
      </div>

      <div className="space-y-2 p-3">
        {sessions.length === 0 && (
          <p className="py-10 text-center text-zinc-500 dark:text-zinc-400">Zatím tu nejsou žádné tréninky.</p>
        )}
        {sessions.map((s) => {
          const sets = d.sets.filter((x) => x.sessionId === s.id);
          const exCount = new Set(sets.map((x) => x.exerciseId)).size;
          return (
            <a key={s.id} href={`#/historie/${s.id}`} className={`${card} flex overflow-hidden active:opacity-80`}>
              <span className={`w-1.5 shrink-0 ${TYPE_ACCENT[s.typeId].bar}`} />
              <span className="min-w-0 flex-1 p-3">
                <span className="flex items-center justify-between gap-2">
                  <span className="font-bold">{formatDate(s.date)}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${TYPE_ACCENT[s.typeId].badge}`}>
                    {typeName(d, s.typeId)}
                  </span>
                </span>
                <span className="block text-sm text-zinc-500 dark:text-zinc-400">
                  {s.status === 'active' && <span className="font-semibold text-amber-600 dark:text-amber-400">rozpracováno · </span>}
                  {plural(exCount, EXERCISE_FORMS)} · {plural(sets.length, SERIES_FORMS)}
                </span>
                {s.note && <span className="mt-1 block truncate text-sm italic text-zinc-600 dark:text-zinc-300">{s.note}</span>}
              </span>
            </a>
          );
        })}
      </div>
    </>
  );
}
