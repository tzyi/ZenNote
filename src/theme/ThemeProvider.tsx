import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { DarkColors, LightColors, ColorScheme, ThemeMode } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, elevation } from './spacing';

export interface Theme {
  mode: 'dark' | 'light';
  colors: ColorScheme;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  elevation: typeof elevation;
}

const buildTheme = (mode: 'dark' | 'light'): Theme => ({
  mode,
  colors: mode === 'dark' ? DarkColors : LightColors,
  typography,
  spacing,
  borderRadius,
  elevation,
});

interface ThemeContextValue {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: buildTheme('dark'),
  themeMode: 'dark',
  setThemeMode: () => undefined,
});

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');

  const resolvedMode: 'dark' | 'light' =
    themeMode === 'system' ? (systemScheme ?? 'dark') : themeMode;

  const theme = buildTheme(resolvedMode);

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

export function useColors(): ColorScheme {
  return useContext(ThemeContext).theme.colors;
}
