import { useRoute } from './router';
import Home from './screens/Home';
import Workout from './screens/Workout';
import History from './screens/History';
import HistoryDetail from './screens/HistoryDetail';
import Progress from './screens/Progress';
import Settings from './screens/Settings';
import { ChartIcon, GearIcon, HomeIcon, ListIcon } from './components/Icons';

const NAV = [
  { path: '/', label: 'Domů', Icon: HomeIcon },
  { path: '/historie', label: 'Historie', Icon: ListIcon },
  { path: '/progres', label: 'Progres', Icon: ChartIcon },
  { path: '/nastaveni', label: 'Nastavení', Icon: GearIcon },
];

export default function App() {
  const route = useRoute();
  const parts = route.split('/').filter(Boolean);

  let screen;
  let showNav = true;
  if (parts[0] === 'trenink' && parts[1]) {
    screen = <Workout key={parts[1]} id={parts[1]} />;
    showNav = false;
  } else if (parts[0] === 'historie' && parts[1]) {
    screen = <HistoryDetail id={parts[1]} />;
  } else if (parts[0] === 'historie') {
    screen = <History />;
  } else if (parts[0] === 'progres') {
    screen = <Progress initialExerciseId={parts[1]} />;
  } else if (parts[0] === 'nastaveni') {
    screen = <Settings />;
  } else {
    screen = <Home />;
  }

  const active = '/' + (parts[0] ?? '');

  return (
    <div className="mx-auto min-h-dvh max-w-xl">
      <main className={showNav ? 'pb-[calc(5rem+env(safe-area-inset-bottom))]' : ''}>{screen}</main>
      {showNav && (
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
          <div className="mx-auto grid max-w-xl grid-cols-4">
            {NAV.map(({ path, label, Icon }) => {
              const isActive = active === path;
              return (
                <a
                  key={path}
                  href={'#' + path}
                  className={`flex h-16 flex-col items-center justify-center gap-0.5 text-xs font-medium ${
                    isActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  <Icon />
                  {label}
                </a>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
