import React, { useEffect, useState } from 'react';
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid';

export const ThemeToggle: React.FC = () => {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      setDark(true);
      document.documentElement.classList.add('dark-theme');
    }
  }, []);

  const toggle = () => {
    setDark(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
      }
      return next;
    });
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="relative h-10 w-10 rounded-xl surface-glass shadow-ambient flex items-center justify-center overflow-hidden group transition-colors"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-amber-400/20 to-pink-400/10" />
      {dark ? (
        <SunIcon className="h-6 w-6 text-amber-300 drop-shadow" />
      ) : (
        <MoonIcon className="h-6 w-6 text-amber-500" />
      )}
    </button>
  );
};
