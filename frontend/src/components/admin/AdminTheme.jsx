import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const STORAGE_KEY = 'ccf-admin-light-mode';
const ThemeContext = createContext(null);

function readLightMode() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === null) {
      return true;
    }
    return stored !== 'false';
  } catch {
    return true;
  }
}

function writeLightMode(value) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value ? 'true' : 'false');
  } catch {
    /* ignore quota / private mode */
  }
}

export function AdminThemeProvider({ children }) {
  const [lightMode, setLightModeState] = useState(readLightMode);

  const setLightMode = useCallback((value) => {
    setLightModeState(value);
    writeLightMode(value);
  }, []);

  const value = useMemo(() => ({ lightMode, setLightMode }), [lightMode, setLightMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAdminTheme() {
  const theme = useContext(ThemeContext);

  if (!theme) {
    throw new Error('useAdminTheme must be used inside AdminThemeProvider');
  }

  return theme;
}
