import { useState } from 'react';
import { btnDanger, btnPrimary, btnSecondary, input } from '../theme';
import { fmtInput, parseNum } from '../utils';

interface Props {
  initial: { weight: number; reps: number } | null;
  saveLabel: string;
  onSave: (weight: number, reps: number) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

const stepBtn =
  'flex h-12 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-200 text-2xl font-bold active:bg-zinc-300 dark:bg-zinc-800 dark:active:bg-zinc-700';

export default function SetEditor({ initial, saveLabel, onSave, onCancel, onDelete }: Props) {
  const [w, setW] = useState(initial ? fmtInput(initial.weight) : '');
  const [r, setR] = useState(initial ? String(initial.reps) : '');

  const weight = parseNum(w);
  const reps = parseNum(r);
  const valid = weight !== null && weight >= 0 && reps !== null && Number.isInteger(reps) && reps > 0;

  const stepWeight = (delta: number) => setW(fmtInput(Math.max(0, (weight ?? 0) + delta)));
  const stepReps = (delta: number) => setR(String(Math.max(1, (reps ?? 0) + delta)));

  const submit = () => {
    if (valid) onSave(weight!, reps!);
  };

  return (
    <form
      className="space-y-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-zinc-500 dark:text-zinc-400">Váha (kg)</span>
          <div className="flex gap-1">
            <button type="button" className={stepBtn} onClick={() => stepWeight(-2.5)} aria-label="Ubrat 2,5 kg">
              −
            </button>
            <input
              className={`${input} h-12 w-full min-w-0 text-center text-xl font-bold`}
              inputMode="decimal"
              enterKeyHint="next"
              autoFocus={!initial}
              value={w}
              onChange={(e) => setW(e.target.value)}
              onFocus={(e) => e.target.select()}
            />
            <button type="button" className={stepBtn} onClick={() => stepWeight(2.5)} aria-label="Přidat 2,5 kg">
              +
            </button>
          </div>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-zinc-500 dark:text-zinc-400">Opakování</span>
          <div className="flex gap-1">
            <button type="button" className={stepBtn} onClick={() => stepReps(-1)} aria-label="Ubrat opakování">
              −
            </button>
            <input
              className={`${input} h-12 w-full min-w-0 text-center text-xl font-bold`}
              inputMode="numeric"
              pattern="[0-9]*"
              enterKeyHint="done"
              value={r}
              onChange={(e) => setR(e.target.value)}
              onFocus={(e) => e.target.select()}
            />
            <button type="button" className={stepBtn} onClick={() => stepReps(1)} aria-label="Přidat opakování">
              +
            </button>
          </div>
        </label>
      </div>
      <div className="flex gap-2">
        {onDelete && (
          <button type="button" className={`${btnDanger} h-12`} onClick={onDelete}>
            Smazat
          </button>
        )}
        <button type="button" className={`${btnSecondary} h-12`} onClick={onCancel}>
          {onDelete ? 'Zrušit' : 'Zavřít'}
        </button>
        <button type="submit" className={`${btnPrimary} h-12 flex-1`} disabled={!valid}>
          {saveLabel}
        </button>
      </div>
    </form>
  );
}
