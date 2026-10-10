import { useSyncExternalStore } from 'react';
import type { AppData, Exercise, Session, TypeId, WorkSet } from './types';
import { TYPE_IDS } from './types';
import { createDefaultData } from './defaults';
import { todayISO, uid } from './utils';

const KEY = 'trenink-denik-v1';

/** Ověří a doplní data (z localStorage nebo z importu). Vrací null, pokud nejsou platná. */
export function normalizeData(x: unknown): AppData | null {
  if (!x || typeof x !== 'object') return null;
  const d = x as Partial<AppData>;
  if (!Array.isArray(d.types) || !Array.isArray(d.exercises) || !Array.isArray(d.sessions) || !Array.isArray(d.sets)) {
    return null;
  }
  const types = TYPE_IDS.map((id) => {
    const t = d.types!.find((t) => t?.id === id);
    return { id, name: typeof t?.name === 'string' && t.name.trim() ? t.name : `Trénink ${id}` };
  });
  const isType = (v: unknown): v is TypeId => TYPE_IDS.includes(v as TypeId);
  const exercises = d.exercises.filter((e) => e && typeof e.id === 'string' && typeof e.name === 'string' && isType(e.typeId));
  const sessions = d.sessions
    .filter((s) => s && typeof s.id === 'string' && isType(s.typeId) && typeof s.date === 'string')
    .map((s) => ({
      ...s,
      note: s.note ?? '',
      status: s.status === 'active' ? 'active' : 'done',
      createdAt: s.createdAt ?? 0,
      extraExerciseIds: Array.isArray(s.extraExerciseIds) ? s.extraExerciseIds : [],
    })) as Session[];
  const sets = d.sets.filter(
    (s) => s && typeof s.id === 'string' && typeof s.weight === 'number' && typeof s.reps === 'number',
  );
  return { version: 1, types, exercises, sessions, sets };
}

function load(): AppData {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = normalizeData(JSON.parse(raw));
      if (parsed) return parsed;
    }
  } catch {
    // poškozená data – začneme s výchozími
  }
  const fresh = createDefaultData();
  localStorage.setItem(KEY, JSON.stringify(fresh));
  return fresh;
}

let data: AppData = load();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function commit(next: AppData) {
  data = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    alert('Data se nepodařilo uložit (plné úložiště prohlížeče?). Udělej si export zálohy v Nastavení.');
  }
  emit();
}

// Synchronizace mezi více otevřenými záložkami.
window.addEventListener('storage', (e) => {
  if (e.key === KEY) {
    data = load();
    emit();
  }
});

export function getData(): AppData {
  return data;
}

export function useData(): AppData {
  return useSyncExternalStore((cb) => {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }, getData);
}

function activeExercisesOfType(d: AppData, typeId: TypeId): Exercise[] {
  return d.exercises.filter((e) => e.typeId === typeId && !e.archived && !e.adhoc).sort((a, b) => a.order - b.order);
}

export const actions = {
  renameType(id: TypeId, name: string) {
    commit({ ...data, types: data.types.map((t) => (t.id === id ? { ...t, name } : t)) });
  },

  addExercise(typeId: TypeId, name: string, adhoc = false): string {
    const id = uid();
    const order = Math.max(-1, ...data.exercises.filter((e) => e.typeId === typeId).map((e) => e.order)) + 1;
    const ex: Exercise = { id, typeId, name, order };
    if (adhoc) ex.adhoc = true;
    commit({ ...data, exercises: [...data.exercises, ex] });
    return id;
  },

  renameExercise(id: string, name: string) {
    commit({ ...data, exercises: data.exercises.map((e) => (e.id === id ? { ...e, name } : e)) });
  },

  /** Cvik se sériemi v historii se jen archivuje, jinak se smaže úplně. */
  deleteExercise(id: string) {
    const used = data.sets.some((s) => s.exerciseId === id);
    if (used) {
      commit({ ...data, exercises: data.exercises.map((e) => (e.id === id ? { ...e, archived: true } : e)) });
    } else {
      commit({
        ...data,
        exercises: data.exercises.filter((e) => e.id !== id),
        sessions: data.sessions.map((s) =>
          s.extraExerciseIds.includes(id) ? { ...s, extraExerciseIds: s.extraExerciseIds.filter((x) => x !== id) } : s,
        ),
      });
    }
  },

  moveExercise(id: string, dir: -1 | 1) {
    const ex = data.exercises.find((e) => e.id === id);
    if (!ex) return;
    const list = activeExercisesOfType(data, ex.typeId);
    const i = list.findIndex((e) => e.id === id);
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    const orderById = new Map(list.map((e, idx) => [e.id, idx]));
    commit({
      ...data,
      exercises: data.exercises.map((e) => (orderById.has(e.id) ? { ...e, order: orderById.get(e.id)! } : e)),
    });
  },

  /** Vrátí rozpracovaný trénink daného typu, nebo založí nový. */
  startSession(typeId: TypeId): string {
    const existing = data.sessions.find((s) => s.status === 'active' && s.typeId === typeId);
    if (existing) return existing.id;
    const session: Session = {
      id: uid(),
      typeId,
      date: todayISO(),
      note: '',
      status: 'active',
      createdAt: Date.now(),
      extraExerciseIds: [],
    };
    commit({ ...data, sessions: [...data.sessions, session] });
    return session.id;
  },

  updateSession(id: string, patch: Partial<Pick<Session, 'date' | 'note'>>) {
    commit({ ...data, sessions: data.sessions.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  },

  finishSession(id: string) {
    commit({ ...data, sessions: data.sessions.map((s) => (s.id === id ? { ...s, status: 'done' } : s)) });
  },

  deleteSession(id: string) {
    commit({
      ...data,
      sessions: data.sessions.filter((s) => s.id !== id),
      sets: data.sets.filter((s) => s.sessionId !== id),
    });
  },

  addExerciseToSession(sessionId: string, exerciseId: string) {
    commit({
      ...data,
      sessions: data.sessions.map((s) =>
        s.id === sessionId && !s.extraExerciseIds.includes(exerciseId)
          ? { ...s, extraExerciseIds: [...s.extraExerciseIds, exerciseId] }
          : s,
      ),
    });
  },

  addSet(sessionId: string, exerciseId: string, weight: number, reps: number) {
    const existing = data.sets.filter((s) => s.sessionId === sessionId && s.exerciseId === exerciseId);
    const order = Math.max(-1, ...existing.map((s) => s.order)) + 1;
    const set: WorkSet = { id: uid(), sessionId, exerciseId, weight, reps, order };
    commit({ ...data, sets: [...data.sets, set] });
  },

  updateSet(id: string, weight: number, reps: number) {
    commit({ ...data, sets: data.sets.map((s) => (s.id === id ? { ...s, weight, reps } : s)) });
  },

  deleteSet(id: string) {
    commit({ ...data, sets: data.sets.filter((s) => s.id !== id) });
  },

  replaceAll(next: AppData) {
    commit(next);
  },
};
