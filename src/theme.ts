import type { TypeId } from './types';

/** Barevné odlišení 4 typů tréninku (proužek / štítek). */
export const TYPE_ACCENT: Record<TypeId, { bar: string; badge: string }> = {
  A: { bar: 'bg-blue-600 dark:bg-blue-400', badge: 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200' },
  B: { bar: 'bg-emerald-600 dark:bg-emerald-400', badge: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200' },
  C: { bar: 'bg-amber-500 dark:bg-amber-400', badge: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200' },
  D: { bar: 'bg-violet-600 dark:bg-violet-400', badge: 'bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-200' },
};

export const card = 'rounded-2xl bg-white shadow-sm dark:bg-zinc-900';
export const btnPrimary =
  'rounded-xl bg-blue-600 px-4 font-semibold text-white active:bg-blue-700 disabled:opacity-40 dark:bg-blue-500 dark:active:bg-blue-600';
export const btnSecondary =
  'rounded-xl bg-zinc-200 px-4 font-semibold text-zinc-900 active:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:active:bg-zinc-700';
export const btnDanger =
  'rounded-xl bg-red-100 px-4 font-semibold text-red-700 active:bg-red-200 dark:bg-red-950 dark:text-red-300 dark:active:bg-red-900';
export const input =
  'rounded-xl border border-zinc-300 bg-white px-3 text-lg text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100';
