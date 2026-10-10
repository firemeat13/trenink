import { useEffect, useRef, useState } from 'react';

export interface ChartPoint {
  y: number;
  label: string; // datum pro popisky
}

interface Props {
  points: ChartPoint[];
  format: (v: number) => string;
  ariaLabel: string;
}

const H = 220;
const PAD = { top: 20, right: 20, bottom: 28, left: 48 };

function niceStep(range: number): number {
  const raw = range / 4;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * pow;
}

/** Jednoduchý čárový graf (jedna řada) s klepnutím/najetím pro zobrazení hodnoty. */
export default function LineChart({ points, format, ariaLabel }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(320);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(200, entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const ys = points.map((p) => p.y);
  let yMin = Math.min(...ys);
  let yMax = Math.max(...ys);
  if (yMin === yMax) {
    yMin -= Math.max(1, Math.abs(yMin) * 0.1);
    yMax += Math.max(1, Math.abs(yMax) * 0.1);
  }
  const step = niceStep(yMax - yMin);
  yMin = Math.max(0, Math.floor(yMin / step) * step);
  yMax = Math.ceil(yMax / step) * step;
  const ticks: number[] = [];
  for (let v = yMin; v <= yMax + step / 2; v += step) ticks.push(v);

  // Osa X = pořadí tréninků (rovnoměrně), aby se tréninky ze stejného dne nepřekrývaly.
  const n = points.length;
  const plotW = width - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const sx = (i: number) => PAD.left + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const sy = (y: number) => PAD.top + (1 - (y - yMin) / (yMax - yMin)) * plotH;

  const path = points.map((p, i) => `${i ? 'L' : 'M'}${sx(i).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' ');

  const pick = (clientX: number) => {
    const x = clientX - ref.current!.getBoundingClientRect().left;
    const i = n === 1 ? 0 : Math.round(((x - PAD.left) / plotW) * (n - 1));
    setActive(Math.min(n - 1, Math.max(0, i)));
  };

  const last = points[points.length - 1];
  const a = active !== null ? (points[active] ?? null) : null;

  return (
    <div ref={ref} className="relative select-none touch-pan-y">
      <svg
        width={width}
        height={H}
        role="img"
        aria-label={ariaLabel}
        onPointerDown={(e) => pick(e.clientX)}
        onPointerMove={(e) => pick(e.clientX)}
        onPointerLeave={(e) => e.pointerType === 'mouse' && setActive(null)}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={width - PAD.right} y1={sy(t)} y2={sy(t)} className="stroke-zinc-200 dark:stroke-zinc-800" strokeWidth={1} />
            <text x={PAD.left - 8} y={sy(t)} dy="0.32em" textAnchor="end" className="fill-zinc-500 text-[11px] dark:fill-zinc-400">
              {format(t)}
            </text>
          </g>
        ))}
        <text x={sx(0)} y={H - 8} textAnchor={points.length > 1 ? 'start' : 'middle'} className="fill-zinc-500 text-[11px] dark:fill-zinc-400">
          {points[0].label}
        </text>
        {points.length > 1 && (
          <text x={sx(n - 1)} y={H - 8} textAnchor="end" className="fill-zinc-500 text-[11px] dark:fill-zinc-400">
            {last.label}
          </text>
        )}

        {a && <line x1={sx(active!)} x2={sx(active!)} y1={PAD.top} y2={PAD.top + plotH} className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth={1} />}

        <path d={path} fill="none" className="stroke-blue-600 dark:stroke-blue-400" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={sx(i)}
            cy={sy(p.y)}
            r={i === active ? 6 : 4}
            className="fill-blue-600 stroke-white dark:fill-blue-400 dark:stroke-zinc-900"
            strokeWidth={2}
          />
        ))}
        {/* Přímý popisek poslední hodnoty */}
        {!a && (
          <text x={sx(n - 1)} y={sy(last.y) - 10} textAnchor={points.length > 1 ? 'end' : 'middle'} className="fill-zinc-900 text-xs font-semibold dark:fill-zinc-100">
            {format(last.y)}
          </text>
        )}
      </svg>

      {a && (
        <div
          className="pointer-events-none absolute top-0 rounded-lg bg-zinc-900 px-2 py-1 text-xs text-white shadow dark:bg-zinc-100 dark:text-zinc-900"
          style={{ left: Math.min(Math.max(sx(active!) - 50, 0), width - 100), width: 100 }}
        >
          <div className="opacity-80">{a.label}</div>
          <div className="font-semibold">{format(a.y)}</div>
        </div>
      )}
    </div>
  );
}
