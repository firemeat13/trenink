import { useEffect, useState } from 'react';

// Hash router – funguje bez konfigurace serveru (GitHub Pages) i offline.
export function useRoute(): string {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => {
      setHash(window.location.hash);
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash.replace(/^#/, '') || '/';
}

export function navigate(path: string) {
  window.location.hash = path;
}
