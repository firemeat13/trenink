import type { AppData, Exercise, TypeId } from './types';
import { TYPE_IDS } from './types';
import { uid } from './utils';

const SAMPLE_EXERCISES: Record<TypeId, string[]> = {
  A: ['Bench press', 'Tlaky s jednoručkami na šikmé lavici', 'Kliky na bradlech', 'Francouzský tlak'],
  B: ['Dřep s velkou činkou', 'Rumunský mrtvý tah', 'Legpress', 'Výpady', 'Výpony na lýtka'],
  C: ['Shyby', 'Přítahy velké činky v předklonu', 'Stahování horní kladky', 'Bicepsový zdvih'],
  D: ['Tlaky nad hlavu', 'Upažování s jednoručkami', 'Face pull', 'Zkracovačky na kladce'],
};

export function createDefaultData(): AppData {
  const exercises: Exercise[] = TYPE_IDS.flatMap((typeId) =>
    SAMPLE_EXERCISES[typeId].map((name, order) => ({ id: uid(), typeId, name, order })),
  );
  return {
    version: 1,
    types: TYPE_IDS.map((id) => ({ id, name: `Trénink ${id}` })),
    exercises,
    sessions: [],
    sets: [],
  };
}
