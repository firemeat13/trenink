import { useMemo, useState } from 'react';
import { useData } from '../store';
import { navigate } from '../router';
import { exerciseHistory } from '../selectors';
import Header from '../components/Header';
import LineChart from '../components/LineChart';
import { card, input } from '../theme';
import { fmtNum, formatDate, formatShortDate } from '../utils';

type Metric = 'max' | 'volume';

export default function Progress({ initialExerciseId }: { initialExerciseId?: string }) {
  const d = useData();
  const [metric, setMetric] = useState<Metric>('max');

  const usedIds = useMemo(() => new Set(d.sets.map((s) => s.exerciseId)), [d.sets]);
  const groups = d.types.map((t) => ({
    type: t,
    exercises: d.exercises
      .filter((e) => e.typeId === t.id && ((!e.archived && !e.adhoc) || usedIds.has(e.id)))
      .sort((a, b) => Number(!!a.archived || !!a.adhoc) - Number(!!b.archived || !!b.adhoc) || a.order - b.order),
  }));

  const all = groups.flatMap((g) => g.exercises);
  const exercise =
    all.find((e) => e.id === initialExerciseId) ?? all.find((e) => usedIds.has(e.id)) ?? all[0];

  const history = exercise ? exerciseHistory(d, exercise.id) : [];
  const points = history.map((p) => ({
    y: metric === 'max' ? p.maxWeight : p.volume,
    label: formatShortDate(p.session.date),
  }));
  const best = Math.max(0, ...history.map((p) => p.maxWeight));
  const kg = (v: number) => `${fmtNum(v)} kg`;

  const tab = (m: Metric) =>
    `h-10 flex-1 rounded-lg text-sm font-semibold ${
      metric === m ? 'bg-white shadow-sm dark:bg-zinc-700' : 'text-zinc-500 dark:text-zinc-400'
    }`;

  return (
    <>
      <Header title="Progres" />
      <div className="space-y-3 p-3">
        <select
          className={`${input} h-12 w-full`}
          value={exercise?.id ?? ''}
          onChange={(e) => navigate(`/progres/${e.target.value}`)}
        >
          {groups.map((g) => (
            <optgroup key={g.type.id} label={g.type.name}>
              {g.exercises.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                  {e.archived ? ' (smazaný)' : e.adhoc ? ' (jednorázový)' : ''}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        <div className="flex gap-1 rounded-xl bg-zinc-200 p-1 dark:bg-zinc-800">
          <button className={tab('max')} onClick={() => setMetric('max')}>
            Nejvyšší váha
          </button>
          <button className={tab('volume')} onClick={() => setMetric('volume')}>
            Celkový objem
          </button>
        </div>

        {history.length === 0 ? (
          <p className={`${card} p-6 text-center text-zinc-500 dark:text-zinc-400`}>
            U tohoto cviku zatím nejsou žádné dokončené tréninky.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2">
              <Stat label="Rekord" value={kg(best)} />
              <Stat label="Naposledy" value={kg(history[history.length - 1].maxWeight)} />
              <Stat label="Tréninků" value={String(history.length)} />
            </div>

            <div className={`${card} p-3`}>
              <h2 className="mb-1 text-sm font-semibold">
                {metric === 'max' ? 'Nejvyšší váha v tréninku (kg)' : 'Objem: váha × opakování, součet sérií (kg)'}
              </h2>
              <LineChart key={`${exercise!.id}-${metric}`} points={points} format={(v) => fmtNum(v)} ariaLabel={`Vývoj – ${exercise!.name}`} />
              {history.length === 1 && (
                <p className="text-center text-xs text-zinc-500">Graf se rozkreslí po dalším tréninku.</p>
              )}
            </div>

            <div className={`${card} overflow-hidden`}>
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 text-left text-xs text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400">
                  <tr>
                    <th className="p-2 pl-3 font-semibold">Datum</th>
                    <th className="p-2 font-semibold">Série</th>
                    <th className="p-2 text-right font-semibold">Max</th>
                    <th className="p-2 pr-3 text-right font-semibold">Objem</th>
                  </tr>
                </thead>
                <tbody>
                  {[...history].reverse().map((p) => (
                    <tr key={p.session.id} className="border-t border-zinc-100 dark:border-zinc-800">
                      <td className="p-2 pl-3 whitespace-nowrap">
                        <a href={`#/historie/${p.session.id}`} className="underline-offset-2 active:underline">
                          {formatDate(p.session.date)}
                        </a>
                      </td>
                      <td className="p-2 text-zinc-600 dark:text-zinc-300">
                        {p.sets.map((x) => `${fmtNum(x.weight)}×${x.reps}`).join(', ')}
                      </td>
                      <td className="p-2 text-right font-semibold whitespace-nowrap">{fmtNum(p.maxWeight)}</td>
                      <td className="p-2 pr-3 text-right whitespace-nowrap">{fmtNum(p.volume)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={`${card} p-3`}>
      <div className="text-xs text-zinc-500 dark:text-zinc-400">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}
