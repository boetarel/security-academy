import React, { useState, useEffect, createContext } from 'react';

/* -------------------------------------------------------
   Dark-mode context — provides { dark, toggleDark }
   Persists preference in localStorage under 'mcmaster-theme'
------------------------------------------------------- */
const ThemeContext = createContext({ dark: false, toggleDark: () => {} });

export function RootLayout({ children }) {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('mcmaster-theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('mcmaster-theme', dark ? 'dark' : 'light');
  }, [dark]);

  const toggleDark = () => setDark(d => !d);

  return (
    <ThemeContext.Provider value={{ dark, toggleDark, theme: dark ? 'dark' : 'light' }}>
      <div className="noise-overlay" />

      {/* Floating dark-mode toggle */}
      <button
        onClick={toggleDark}
        aria-label="Toggle dark mode"
        className="fixed bottom-6 right-6 z-[9998] w-12 h-12 rounded-full
          bg-deep dark:bg-surface border border-divider dark:border-dark-border
          flex items-center justify-center shadow-lg
          hover:scale-110 transition-transform duration-200
          text-dark-ink dark:text-ink"
        title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {dark ? (
          /* Sun icon */
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
          </svg>
        ) : (
          /* Moon icon */
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        )}
      </button>

      {children}
    </ThemeContext.Provider>
  );
}
