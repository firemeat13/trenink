export type TypeId = 'A' | 'B' | 'C' | 'D';
export const TYPE_IDS: TypeId[] = ['A', 'B', 'C', 'D'];

/** Jeden ze 4 druhů tréninku (název lze přejmenovat). */
export interface WorkoutType {
  id: TypeId;
  name: string;
}

export interface Exercise {
  id: string;
  typeId: TypeId;
  name: string;
  order: number;
  /** Smazaný cvik, který má záznamy v historii – skrytý, ale zachovaný. */
  archived?: boolean;
  /** Cvik přidaný jen do jednoho tréninku (není trvale v typu tréninku). */
  adhoc?: boolean;
}

export interface Session {
  id: string;
  typeId: TypeId;
  /** Datum ve formátu YYYY-MM-DD (místní čas). */
  date: string;
  note: string;
  status: 'active' | 'done';
  createdAt: number;
  /** Cviky přidané navíc během tohoto tréninku. */
  extraExerciseIds: string[];
}

export interface WorkSet {
  id: string;
  sessionId: string;
  exerciseId: string;
  weight: number;
  reps: number;
  order: number;
}

export interface AppData {
  version: 1;
  types: WorkoutType[];
  exercises: Exercise[];
  sessions: Session[];
  sets: WorkSet[];
}
