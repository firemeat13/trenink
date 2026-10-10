import { useRef, useState } from 'react';
import { actions, getData, normalizeData, useData } from '../store';
import { exercisesOfType } from '../selectors';
import Header from '../components/Header';
import { DownIcon, TrashIcon, UpIcon } from '../components/Icons';
import { btnPrimary, btnSecondary, card, input } from '../theme';
import { todayISO } from '../utils';
import type { Exercise, TypeId, WorkoutType } from '../types';

export default function Settings() {
  const d = useData();
  const [typeId, setTypeId] = useState<TypeId>('A');
  const exercises = exercisesOfType(d, typeId);

  return (
    <>
      <Header title="Nastavení" />
      <div className="space-y-4 p-3">
        <section className={`${card} space-y-3 p-4`}>
          <h2 className="text-lg font-bold">Názvy tréninků</h2>
          {d.types.map((t) => (
            <TypeNameInput key={`${t.id}:${t.name}`} type={t} />
          ))}
        </section>

        <section className={`${card} space-y-3 p-4`}>
          <h2 className="text-lg font-bold">Cviky</h2>
          <div className="grid grid-cols-4 gap-1 rounded-xl bg-zinc-200 p-1 dark:bg-zinc-800">
            {d.types.map((t) => (
              <button
                key={t.id}
                onClick={() => setTypeId(t.id)}
                className={`h-10 truncate rounded-lg px-1 text-sm font-semibold ${
                  typeId === t.id ? 'bg-white shadow-sm dark:bg-zinc-700' : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>

          <ul className="space-y-2">
            {exercises.map((e, i) => (
              <ExerciseRow key={`${e.id}:${e.name}`} exercise={e} first={i === 0} last={i === exercises.length - 1} />
            ))}
            {exercises.length === 0 && <li className="text-sm text-zinc-500">Žádné cviky.</li>}
          </ul>

          <NewExercise typeId={typeId} />
        </section>

        <Backup />

        <p className="pb-2 text-center text-xs text-zinc-400">
          Data jsou uložena jen v tomto prohlížeči. Pravidelně si dělej zálohu.
        </p>
      </div>
    </>
  );
}

function TypeNameInput({ type }: { type: WorkoutType }) {
  const [value, setValue] = useState(type.name);
  const save = () => {
    const v = value.trim();
    if (v && v !== type.name) actions.renameType(type.id, v);
    else setValue(type.name);
  };
  return (
    <input
      className={`${input} h-12 w-full`}
      value={value}
      aria-label={`Název tréninku ${type.id}`}
      enterKeyHint="done"
      onChange={(e) => setValue(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
    />
  );
}

function ExerciseRow({ exercise, first, last }: { exercise: Exercise; first: boolean; last: boolean }) {
  const [value, setValue] = useState(exercise.name);
  const save = () => {
    const v = value.trim();
    if (v && v !== exercise.name) actions.renameExercise(exercise.id, v);
    else setValue(exercise.name);
  };
  const remove = () => {
    if (confirm(`Smazat cvik „${exercise.name}“? Záznamy v historii zůstanou zachovány.`)) {
      actions.deleteExercise(exercise.id);
    }
  };
  const iconBtn =
    'flex h-11 w-10 shrink-0 items-center justify-center rounded-lg active:bg-zinc-200 disabled:opacity-25 dark:active:bg-zinc-800';

  return (
    <li className="flex items-center gap-1">
      <input
        className={`${input} h-11 min-w-0 flex-1 text-base`}
        value={value}
        aria-label="Název cviku"
        enterKeyHint="done"
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      />
      <button className={iconBtn} disabled={first} onClick={() => actions.moveExercise(exercise.id, -1)} aria-label="Posunout nahoru">
        <UpIcon />
      </button>
      <button className={iconBtn} disabled={last} onClick={() => actions.moveExercise(exercise.id, 1)} aria-label="Posunout dolů">
        <DownIcon />
      </button>
      <button className={`${iconBtn} text-red-600 dark:text-red-400`} onClick={remove} aria-label="Smazat cvik">
        <TrashIcon />
      </button>
    </li>
  );
}

function NewExercise({ typeId }: { typeId: TypeId }) {
  const [name, setName] = useState('');
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const n = name.trim();
        if (!n) return;
        actions.addExercise(typeId, n);
        setName('');
      }}
    >
      <input
        className={`${input} h-12 min-w-0 flex-1`}
        placeholder="Nový cvik"
        enterKeyHint="done"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button type="submit" className={`${btnPrimary} h-12`} disabled={!name.trim()}>
        Přidat
      </button>
    </form>
  );
}

function Backup() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(getData(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trenink-zaloha-${todayISO()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage('Záloha byla stažena.');
  };

  const importData = async (file: File) => {
    try {
      const parsed = normalizeData(JSON.parse(await file.text()));
      if (!parsed) {
        setMessage('Soubor neobsahuje platnou zálohu tréninků.');
        return;
      }
      const ok = confirm(
        `Import nahradí všechna současná data (${parsed.sessions.length} tréninků, ${parsed.exercises.length} cviků). Pokračovat?`,
      );
      if (!ok) return;
      actions.replaceAll(parsed);
      setMessage('Data byla úspěšně importována.');
    } catch {
      setMessage('Soubor se nepodařilo načíst – není to platný JSON.');
    }
  };

  return (
    <section className={`${card} space-y-3 p-4`}>
      <h2 className="text-lg font-bold">Záloha dat</h2>
      <div className="flex gap-2">
        <button className={`${btnPrimary} h-12 flex-1`} onClick={exportData}>
          Export do JSON
        </button>
        <button className={`${btnSecondary} h-12 flex-1`} onClick={() => fileRef.current?.click()}>
          Import z JSON
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) importData(f);
          e.target.value = '';
        }}
      />
      {message && <p className="text-sm text-zinc-600 dark:text-zinc-300">{message}</p>}
    </section>
  );
}
