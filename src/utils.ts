export function uid(): string {
  // crypto.randomUUID není dostupné mimo HTTPS (např. při testování přes IP v lokální síti).
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto && window.isSecureContext) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

export function todayISO(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function isoToDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDate(iso: string): string {
  return isoToDate(iso).toLocaleDateString('cs-CZ', {
    weekday: 'short',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });
}

export function formatShortDate(iso: string): string {
  return isoToDate(iso).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' });
}

export function fmtNum(n: number): string {
  return n.toLocaleString('cs-CZ', { maximumFractionDigits: 2 });
}

/** Hodnota pro textové pole – desetinná čárka, bez oddělovače tisíců. */
export function fmtInput(n: number): string {
  return String(Math.round(n * 100) / 100).replace('.', ',');
}

/** Přijímá desetinnou čárku i tečku. */
export function parseNum(s: string): number | null {
  const t = s.trim().replace(',', '.');
  if (t === '') return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

/** Česká množná čísla: plural(3, ['série', 'série', 'sérií']). */
export function plural(n: number, forms: [string, string, string]): string {
  if (n === 1) return `${n} ${forms[0]}`;
  if (n >= 2 && n <= 4) return `${n} ${forms[1]}`;
  return `${n} ${forms[2]}`;
}

export const SERIES_FORMS: [string, string, string] = ['série', 'série', 'sérií'];
export const EXERCISE_FORMS: [string, string, string] = ['cvik', 'cviky', 'cviků'];
