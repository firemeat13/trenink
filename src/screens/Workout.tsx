import { useState } from 'react';
import { actions, useData } from '../store';
import { navigate } from '../router';
import { prefillFor, previousPerformance, sessionExercises, setsOf, typeName } from '../selectors';
import Header from '../components/Header';
import SetEditor from '../components/SetEditor';
import { PlusIcon } from '../components/Icons';
import { btnPrimary, btnSecondary, card, input } from '../theme';
import { fmtNum, formatShortDate } from '../utils';
import type { AppData, Exercise, Session } from '../types';

export default function Workout({ id }: { id: string }) {
  const d = useData();
  const s = d.sessions.find((x) => x.id === id);

  if (!s) {
    return (
      <>
        <Header title="Trénink nenalezen" back="/" />
        <p className="p-4 text-zinc-500">Tento trénink už neexistuje.</p>
      </>
    );
  }

  const isActive = s.status === 'active';
  const items = sessionExercises(d, s);
  const totalSets = d.sets.filter((x) => x.sessionId === s.id).length;

  const finish = () => {
    if (totalSets === 0 && !confirm('Trénink nemá žádnou zapsanou sérii. Přesto dokončit?')) return;
    actions.finishSession(s.id);
    navigate(`/historie/${s.id}`);
  };

  const discard = () => {
    if (!confirm('Zahodit rozpracovaný trénink včetně všech zapsaných sérií?')) return;
    actions.deleteSession(s.id);
    navigate('/');
  };

  return (
    <>
      <Header
        title={typeName(d, s.typeId)}
        back={isActive ? '/' : `/historie/${s.id}`}
        right={
          <input
            type="date"
            aria-label="Datum tréninku"
            className="h-10 rounded-lg bg-transparent px-1 text-sm text-zinc-600 dark:text-zinc-300"
            value={s.date}
            onChange={(e) => e.target.value && actions.updateSession(s.id, { date: e.target.value })}
          />
        }
      />

      <div className="space-y-3 p-3 pb-[calc(6rem+env(safe-area-inset-bottom))]">
        {!isActive && (
          <p className="rounded-xl bg-blue-50 p-3 text-sm text-blue-900 dark:bg-blue-950/50 dark:text-blue-200">
            Upravuješ dokončený trénink. Změny se ukládají průběžně.
          </p>
        )}

        {items.map(({ exercise, extra }) => (
          <ExerciseCard key={exercise.id} d={d} session={s} exercise={exercise} extra={extra} />
        ))}

        <AddExercise session={s} typeLabel={typeName(d, s.typeId)} />

        <label className={`${card} block p-4`}>
          <span className="mb-2 block font-semibold">Poznámka</span>
          <textarea
            className={`${input} min-h-20 w-full py-2 text-base`}
            placeholder="Jak se cvičilo, únava, bolesti…"
            value={s.note}
            onChange={(e) => actions.updateSession(s.id, { note: e.target.value })}
          />
        </label>

        {isActive && (
          <button onClick={discard} className="w-full py-3 text-sm font-medium text-red-600 dark:text-red-400">
            Zahodit trénink
          </button>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
        <div className="mx-auto max-w-xl">
          {isActive ? (
            <button onClick={finish} className={`${btnPrimary} h-14 w-full text-lg`}>
              Dokončit trénink
            </button>
          ) : (
            <button onClick={() => navigate(`/historie/${s.id}`)} className={`${btnPrimary} h-14 w-full text-lg`}>
              Hotovo
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function ExerciseCard({ d, session, exercise, extra }: { d: AppData; session: Session; exercise: Exercise; extra: boolean }) {
  // null = nic, 'new' = nová série, jinak id upravované série
  const [editing, setEditing] = useState<string | null>(null);
  // Mění se po každém uložení, aby se editor znovu předvyplnil.
  const [editorKey, setEditorKey] = useState(0);

  const sets = setsOf(d, session.id, exercise.id);
  const prev = previousPerformance(d, session, exercise.id);

  return (
    <section className={`${card} p-4`}>
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-bold leading-tight">{exercise.name}</h2>
        {extra && (
          <span className="shrink-0 rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium dark:bg-zinc-800">navíc</span>
        )}
      </div>

      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {prev ? (
          <>
            <span className="font-medium">Minule ({formatShortDate(prev.session.date)}):</span>{' '}
            {prev.sets.map((x) => `${fmtNum(x.weight)} × ${x.reps}`).join(' · ')}
          </>
        ) : (
          'Minule: zatím bez záznamu'
        )}
      </p>

      {sets.length > 0 && (
        <ol className="mt-3 space-y-2">
          {sets.map((x, i) =>
            editing === x.id ? (
              <li key={x.id}>
                <SetEditor
                  initial={x}
                  saveLabel="Uložit změny"
                  onSave={(w, r) => {
                    actions.updateSet(x.id, w, r);
                    setEditing(null);
                  }}
                  onCancel={() => setEditing(null)}
                  onDelete={() => {
                    actions.deleteSet(x.id);
                    setEditing(null);
                  }}
                />
              </li>
            ) : (
              <li key={x.id}>
                <button
                  onClick={() => setEditing(x.id)}
                  className="flex h-12 w-full items-center gap-3 rounded-xl bg-zinc-100 px-3 text-left active:bg-zinc-200 dark:bg-zinc-800 dark:active:bg-zinc-700"
                >
                  <span className="w-6 text-sm font-semibold text-zinc-500 dark:text-zinc-400">{i + 1}.</span>
                  <span className="flex-1 text-lg">
                    <span className="font-bold">{fmtNum(x.weight)}</span> kg × <span className="font-bold">{x.reps}</span>
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">upravit</span>
                </button>
              </li>
            ),
          )}
        </ol>
      )}

      <div className="mt-3">
        {editing === 'new' ? (
          <SetEditor
            key={editorKey}
            initial={prefillFor(d, session, exercise.id)}
            saveLabel="Uložit sérii"
            onSave={(w, r) => {
              actions.addSet(session.id, exercise.id, w, r);
              setEditorKey((k) => k + 1);
            }}
            onCancel={() => setEditing(null)}
          />
        ) : (
          <button
            onClick={() => setEditing('new')}
            className={`${btnSecondary} flex h-12 w-full items-center justify-center gap-2`}
          >
            <PlusIcon /> Přidat sérii
          </button>
        )}
      </div>
    </section>
  );
}

function AddExercise({ session, typeLabel }: { session: Session; typeLabel: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [permanent, setPermanent] = useState(true);

  const submit = () => {
    const n = name.trim();
    if (!n) return;
    if (permanent) {
      actions.addExercise(session.typeId, n);
    } else {
      const exId = actions.addExercise(session.typeId, n, true);
      actions.addExerciseToSession(session.id, exId);
    }
    setName('');
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-300 font-semibold text-zinc-600 active:bg-zinc-200 dark:border-zinc-700 dark:text-zinc-300 dark:active:bg-zinc-900"
      >
        <PlusIcon /> Přidat cvik navíc
      </button>
    );
  }

  return (
    <form
      className={`${card} space-y-3 p-4`}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <input
        className={`${input} h-12 w-full`}
        placeholder="Název cviku"
        autoFocus
        enterKeyHint="done"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" className="h-5 w-5 accent-blue-600" checked={permanent} onChange={(e) => setPermanent(e.target.checked)} />
        Přidat trvale do „{typeLabel}“
      </label>
      <div className="flex gap-2">
        <button type="button" className={`${btnSecondary} h-12`} onClick={() => setOpen(false)}>
          Zrušit
        </button>
        <button type="submit" className={`${btnPrimary} h-12 flex-1`} disabled={!name.trim()}>
          Přidat cvik
        </button>
      </div>
    </form>
  );
}
