import type { AppData, Exercise, Session, TypeId, WorkSet } from './types';

export function sortSessionsDesc(a: Session, b: Session): number {
  return b.date.localeCompare(a.date) || b.createdAt - a.createdAt;
}

function isBefore(a: Session, b: Session): boolean {
  return a.date < b.date || (a.date === b.date && a.createdAt < b.createdAt);
}

export function typeName(d: AppData, id: TypeId): string {
  return d.types.find((t) => t.id === id)?.name ?? `Trénink ${id}`;
}

export function exercisesOfType(d: AppData, typeId: TypeId): Exercise[] {
  return d.exercises.filter((e) => e.typeId === typeId && !e.archived && !e.adhoc).sort((a, b) => a.order - b.order);
}

export function setsOf(d: AppData, sessionId: string, exerciseId: string): WorkSet[] {
  return d.sets.filter((s) => s.sessionId === sessionId && s.exerciseId === exerciseId).sort((a, b) => a.order - b.order);
}

/** Cviky zobrazené v tréninku: cviky typu + cviky navíc / s již zapsanými sériemi. */
export function sessionExercises(d: AppData, s: Session): { exercise: Exercise; extra: boolean }[] {
  const base = exercisesOfType(d, s.typeId);
  const seen = new Set(base.map((e) => e.id));
  const extraIds = [...s.extraExerciseIds, ...d.sets.filter((x) => x.sessionId === s.id).map((x) => x.exerciseId)];
  const extras: Exercise[] = [];
  for (const id of extraIds) {
    if (seen.has(id)) continue;
    const e = d.exercises.find((x) => x.id === id);
    if (e) {
      seen.add(id);
      extras.push(e);
    }
  }
  return [...base.map((exercise) => ({ exercise, extra: false })), ...extras.map((exercise) => ({ exercise, extra: true }))];
}

/** Poslední dokončený trénink (před daným tréninkem), ve kterém byl cvik odcvičen. */
export function previousPerformance(d: AppData, s: Session, exerciseId: string): { session: Session; sets: WorkSet[] } | null {
  const candidates = d.sessions
    .filter((x) => x.id !== s.id && x.status === 'done' && isBefore(x, s))
    .sort(sortSessionsDesc);
  for (const c of candidates) {
    const sets = setsOf(d, c.id, exerciseId);
    if (sets.length) return { session: c, sets };
  }
  return null;
}

/** Předvyplnění nové série: poslední série z tohoto tréninku, jinak z minulého. */
export function prefillFor(d: AppData, s: Session, exerciseId: string): { weight: number; reps: number } | null {
  const current = setsOf(d, s.id, exerciseId);
  if (current.length) return current[current.length - 1];
  const prev = previousPerformance(d, s, exerciseId);
  return prev ? prev.sets[0] : null;
}

export function volume(sets: WorkSet[]): number {
  return sets.reduce((sum, x) => sum + x.weight * x.reps, 0);
}

export interface ExercisePoint {
  session: Session;
  maxWeight: number;
  volume: number;
  sets: WorkSet[];
}

/** Vývoj cviku v čase (jen dokončené tréninky), seřazeno od nejstaršího. */
export function exerciseHistory(d: AppData, exerciseId: string): ExercisePoint[] {
  return d.sessions
    .filter((s) => s.status === 'done')
    .sort((a, b) => -sortSessionsDesc(a, b))
    .map((session) => {
      const sets = setsOf(d, session.id, exerciseId);
      return { session, sets, maxWeight: Math.max(0, ...sets.map((x) => x.weight)), volume: volume(sets) };
    })
    .filter((p) => p.sets.length > 0);
}
