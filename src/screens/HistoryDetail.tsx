import { actions, useData } from '../store';
import { navigate } from '../router';
import { sessionExercises, setsOf, typeName, volume } from '../selectors';
import Header from '../components/Header';
import { TYPE_ACCENT, btnDanger, btnPrimary, card } from '../theme';
import { fmtNum, formatDate } from '../utils';

export default function HistoryDetail({ id }: { id: string }) {
  const d = useData();
  const s = d.sessions.find((x) => x.id === id);

  if (!s) {
    return (
      <>
        <Header title="Trénink nenalezen" back="/historie" />
        <p className="p-4 text-zinc-500">Tento trénink už neexistuje.</p>
      </>
    );
  }

  const items = sessionExercises(d, s)
    .map(({ exercise }) => ({ exercise, sets: setsOf(d, s.id, exercise.id) }))
    .filter((x) => x.sets.length > 0);
  const total = volume(d.sets.filter((x) => x.sessionId === s.id));

  const remove = () => {
    if (!confirm('Opravdu smazat tento trénink? Tuto akci nelze vrátit.')) return;
    actions.deleteSession(s.id);
    navigate('/historie');
  };

  return (
    <>
      <Header title={formatDate(s.date)} back="/historie" />
      <div className="space-y-3 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${TYPE_ACCENT[s.typeId].badge}`}>
            {typeName(d, s.typeId)}
          </span>
          {s.status === 'active' && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              rozpracováno
            </span>
          )}
          <span className="text-sm text-zinc-500 dark:text-zinc-400">Celkový objem: {fmtNum(total)} kg</span>
        </div>

        {s.note && <p className={`${card} p-4 italic`}>{s.note}</p>}

        {items.length === 0 && <p className="py-6 text-center text-zinc-500">V tréninku nejsou žádné série.</p>}

        {items.map(({ exercise, sets }) => (
          <section key={exercise.id} className={`${card} p-4`}>
            <div className="flex items-baseline justify-between gap-2">
              <a href={`#/progres/${exercise.id}`} className="font-bold underline-offset-2 active:underline">
                {exercise.name}
              </a>
              <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">{fmtNum(volume(sets))} kg</span>
            </div>
            <ol className="mt-2 space-y-1">
              {sets.map((x, i) => (
                <li key={x.id} className="flex gap-3 text-base">
                  <span className="w-6 text-sm text-zinc-500 dark:text-zinc-400">{i + 1}.</span>
                  <span>
                    <b>{fmtNum(x.weight)}</b> kg × <b>{x.reps}</b>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        ))}

        <div className="flex gap-2 pt-2">
          <button className={`${btnDanger} h-12`} onClick={remove}>
            Smazat
          </button>
          <button className={`${btnPrimary} h-12 flex-1`} onClick={() => navigate(`/trenink/${s.id}`)}>
            {s.status === 'active' ? 'Pokračovat v tréninku' : 'Upravit trénink'}
          </button>
        </div>
      </div>
    </>
  );
}
