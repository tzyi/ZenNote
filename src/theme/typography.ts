export const typography = {
  fontSizes: {
    xs: 11,
    sm: 12,
    md: 14,
    base: 15,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 30,
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  letterSpacings: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
} as const;
