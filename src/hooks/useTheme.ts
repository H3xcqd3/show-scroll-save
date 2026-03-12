import { useState, useEffect } from 'react';

export type ColorTheme = 'gold' | 'ocean';

export const themes: { id: ColorTheme; label: string; mode: string }[] = [
  { id: 'gold', label: 'Dark', mode: 'Dark' },
  { id: 'ocean', label: 'Light', mode: 'Light' },
];

export const useTheme = () => {
  const [theme, setThemeState] = useState<ColorTheme>(() => {
    return (localStorage.getItem('color-theme') as ColorTheme) || 'gold';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('color-theme', theme);
  }, [theme]);

  useEffect(() => {
    const saved = (localStorage.getItem('color-theme') as ColorTheme) || 'gold';
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  const isDark = theme === 'gold';
  const toggleMode = () => setThemeState(isDark ? 'ocean' : 'gold');

  return { theme, setTheme: setThemeState, isDark, toggleMode };
};
