'use client';
import { useEffect, useState } from 'react';

function applyTheme(t: 'light'|'dark') {
  const root = document.documentElement;
  if (t === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light'|'dark'>(()=> 'dark');

  useEffect(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem('vm-theme')) as 'light'|'dark'|null;
    const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = saved ?? (prefersDark ? 'dark' : 'light');
    setTheme(initial);
    applyTheme(initial);
  }, []);

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (typeof window !== 'undefined') localStorage.setItem('vm-theme', next);
    applyTheme(next);
  }

  return (
    <button onClick={toggle} className="text-sm rounded-md border px-3 py-1">
      {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
    </button>
  );
}
