import { useState, useEffect } from 'react';

export type ColorTheme = 'gold' | 'ocean' | 'crimson' | 'emerald' | 'violet' | 'rose';

export const themes: { id: ColorTheme; label: string; preview: string }[] = [
  { id: 'gold', label: 'Gold (Default)', preview: 'hsl(38, 92%, 50%)' },
  { id: 'ocean', label: 'Ocean Blue', preview: 'hsl(210, 90%, 55%)' },
  { id: 'crimson', label: 'Crimson Red', preview: 'hsl(0, 80%, 55%)' },
  { id: 'emerald', label: 'Emerald Green', preview: 'hsl(155, 70%, 45%)' },
  { id: 'violet', label: 'Violet Purple', preview: 'hsl(270, 70%, 55%)' },
  { id: 'rose', label: 'Rose Pink', preview: 'hsl(340, 75%, 55%)' },
];

export const useTheme = () => {
  const [theme, setThemeState] = useState<ColorTheme>(() => {
    return (localStorage.getItem('color-theme') as ColorTheme) || 'gold';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('color-theme', theme);
  }, [theme]);

  // Apply on mount
  useEffect(() => {
    const saved = (localStorage.getItem('color-theme') as ColorTheme) || 'gold';
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  return { theme, setTheme: setThemeState };
};
