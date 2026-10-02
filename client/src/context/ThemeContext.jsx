import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);
const THEME_KEYS = ['theme', 'shopsphere_theme'];

function getSavedTheme() {
  try {
    for (const key of THEME_KEYS) {
      const val = localStorage.getItem(key);
      if (val === 'dark' || val === 'light') {
        return val;
      }
    }
  } catch {
    // localStorage may be unavailable or disabled
  }
  return null;
}

function getSystemTheme() {
  try {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark';
    }
  } catch {
    // matchMedia may be unavailable
  }
  return 'light';
}

function getInitialTheme() {
  return getSavedTheme() || getSystemTheme();
}

function saveTheme(theme) {
  try {
    for (const key of THEME_KEYS) {
      localStorage.setItem(key, theme);
    }
  } catch {
    // localStorage may be unavailable
  }
}

// Immediately set the theme on documentElement before React renders to prevent flash of wrong theme
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', getInitialTheme());
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);

  // Keep data-theme on <html> in sync with the current theme state
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Listen for OS/system theme changes if no preference has been saved by the user
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        if (!getSavedTheme()) {
          setThemeState(e.matches ? 'dark' : 'light');
        }
      };
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      } else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
      }
    } catch {
      // ignore
    }
  }, []);

  const setTheme = (newTheme) => {
    const value = typeof newTheme === 'function' ? newTheme(theme) : newTheme;
    saveTheme(value);
    setThemeState(value);
  };

  const toggleTheme = () => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      saveTheme(next);
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'light',
      setTheme: () => {},
      toggleTheme: () => {},
    };
  }
  return context;
};
