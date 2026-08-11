import React, { createContext, useContext, useMemo, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

export const lightPalette = {
  primary: '#004ac6',
  secondary: '#505f76',
  tertiary: '#525657',
  background: '#faf8ff',
  surface: '#ffffff',
  onSurface: '#191b23',
  onSurfaceVariant: '#434655',
  primaryContainer: '#2563eb',
  secondaryContainer: '#d0e1fb',
  onPrimaryContainer: '#eeefff',
  onSecondaryContainer: '#54647a',
  outlineVariant: '#c3c6d7',
  surfaceContainer: '#ededf9',
  surfaceContainerHigh: '#e7e7f3',
  error: '#ba1a1a',
  white: '#ffffff',
  black: '#000000',
  green: '#22C55E',
  greenSoft: '#dcfce7',
  amber: '#F59E0B',
  red: '#EF4444',
  violet: '#A855F7',
  textInverse: '#ffffff',
};

export const darkPalette = {
  ...lightPalette,
  background: '#111827',
  surface: '#111827',
  onSurface: '#f8fafc',
  onSurfaceVariant: '#cbd5e1',
  secondary: '#93c5fd',
  tertiary: '#d1d5db',
  primary: '#93c5fd',
  primaryContainer: '#1d4ed8',
  onPrimaryContainer: '#dbeafe',
  onSecondaryContainer: '#dbeafe',
  outlineVariant: '#334155',
  surfaceContainer: '#1f2937',
  surfaceContainerHigh: '#374151',
  greenSoft: 'rgba(34, 197, 94, 0.18)',
};

export type ThemeContextValue = {
  mode: ThemeMode;
  colors: typeof lightPalette;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>('light');
  const colors = useMemo(() => (mode === 'dark' ? darkPalette : lightPalette), [mode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      colors,
      toggleTheme: () => setMode((prev) => (prev === 'light' ? 'dark' : 'light')),
    }),
    [colors, mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
