import { useState, useEffect } from 'react';

export type ColorTheme = 'gold' | 'ocean' | 'crimson' | 'emerald' | 'violet' | 'rose';

export const themes: { id: ColorTheme; label: string; preview: string; mode: string }[] = [
  { id: 'gold', label: 'Gold', preview: 'hsl(38, 92%, 50%)', mode: 'Dark' },
  { id: 'ocean', label: 'Ocean', preview: 'hsl(210, 90%, 50%)', mode: 'Light' },
  { id: 'crimson', label: 'Crimson', preview: 'hsl(0, 80%, 55%)', mode: 'Dark' },
  { id: 'emerald', label: 'Emerald', preview: 'hsl(155, 70%, 40%)', mode: 'Light' },
  { id: 'violet', label: 'Violet', preview: 'hsl(270, 70%, 55%)', mode: 'Dark' },
  { id: 'rose', label: 'Rose', preview: 'hsl(340, 75%, 52%)', mode: 'Light' },
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
