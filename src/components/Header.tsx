import type { ReactNode } from 'react';
import { navigate } from '../router';
import { BackIcon } from './Icons';

export default function Header({ title, back, right }: { title: ReactNode; back?: string; right?: ReactNode }) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-zinc-200 bg-zinc-100/90 px-2 pt-[env(safe-area-inset-top)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="flex h-14 w-full items-center gap-1">
        {back !== undefined ? (
          <button
            onClick={() => navigate(back)}
            className="flex h-11 w-11 items-center justify-center rounded-full active:bg-zinc-200 dark:active:bg-zinc-800"
            aria-label="Zpět"
          >
            <BackIcon />
          </button>
        ) : (
          <span className="w-2" />
        )}
        <h1 className="min-w-0 flex-1 truncate text-xl font-bold">{title}</h1>
        {right}
      </div>
    </header>
  );
}
