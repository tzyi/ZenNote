export interface ColorScheme {
  // Backgrounds
  background: string;
  card: string;
  surface: string;
  surfaceVariant: string;
  overlay: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  // Accents
  accentGreen: string;
  accentGreenLight: string;
  accentBlue: string;
  accentOrange: string;
  accentRed: string;

  // Borders & Dividers
  border: string;
  divider: string;

  // UI Elements
  inputBackground: string;
  placeholder: string;
  icon: string;
  iconActive: string;
  tag: string;
  tagText: string;
  fab: string;
  fabIcon: string;
  header: string;
  sidebar: string;
  chip: string;
  chipActive: string;
  chipText: string;
  chipActiveText: string;
}

export const DarkColors: ColorScheme = {
  // Backgrounds
  background: '#1a1a1a',
  card: '#2a2a2a',
  surface: '#333333',
  surfaceVariant: '#3d3d3d',
  overlay: 'rgba(0, 0, 0, 0.6)',

  // Text
  textPrimary: '#ffffff',
  textSecondary: '#aaaaaa',
  textMuted: '#666666',
  textInverse: '#1a1a1a',

  // Accents
  accentGreen: '#4caf50',
  accentGreenLight: '#81c784',
  accentBlue: '#64b5f6',
  accentOrange: '#ffb74d',
  accentRed: '#e57373',

  // Borders & Dividers
  border: '#3a3a3a',
  divider: '#2d2d2d',

  // UI Elements
  inputBackground: '#2a2a2a',
  placeholder: '#555555',
  icon: '#aaaaaa',
  iconActive: '#4caf50',
  tag: '#333333',
  tagText: '#aaaaaa',
  fab: '#4caf50',
  fabIcon: '#ffffff',
  header: '#1a1a1a',
  sidebar: '#222222',
  chip: '#333333',
  chipActive: '#4caf50',
  chipText: '#aaaaaa',
  chipActiveText: '#ffffff',
};

export const LightColors: ColorScheme = {
  // Backgrounds
  background: '#f5f5f5',
  card: '#ffffff',
  surface: '#eeeeee',
  surfaceVariant: '#e0e0e0',
  overlay: 'rgba(0, 0, 0, 0.4)',

  // Text
  textPrimary: '#1a1a1a',
  textSecondary: '#666666',
  textMuted: '#999999',
  textInverse: '#ffffff',

  // Accents
  accentGreen: '#388e3c',
  accentGreenLight: '#4caf50',
  accentBlue: '#1976d2',
  accentOrange: '#f57c00',
  accentRed: '#d32f2f',

  // Borders & Dividers
  border: '#e0e0e0',
  divider: '#eeeeee',

  // UI Elements
  inputBackground: '#ffffff',
  placeholder: '#bbbbbb',
  icon: '#666666',
  iconActive: '#388e3c',
  tag: '#e8f5e9',
  tagText: '#388e3c',
  fab: '#388e3c',
  fabIcon: '#ffffff',
  header: '#ffffff',
  sidebar: '#fafafa',
  chip: '#e0e0e0',
  chipActive: '#388e3c',
  chipText: '#666666',
  chipActiveText: '#ffffff',
};

export type ThemeMode = 'light' | 'dark' | 'system';
