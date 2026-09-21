import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const KEY = 'taskcollab_theme';
const ThemeContext = createContext(null);
const systemDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

export function ThemeProvider({ children }) {
  // preference: 'light' | 'dark' | 'system'
  const [preference, setPreference] = useState(() => localStorage.getItem(KEY) || 'system');
  const [system, setSystem] = useState(systemDark);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => setSystem(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const resolved = preference === 'system' ? (system ? 'dark' : 'light') : preference;

  useEffect(() => {
    document.documentElement.dataset.theme = resolved;
    localStorage.setItem(KEY, preference);
  }, [resolved, preference]);

  const value = useMemo(
    () => ({ preference, resolved, setPreference, toggle: () => setPreference(resolved === 'dark' ? 'light' : 'dark') }),
    [preference, resolved]
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
