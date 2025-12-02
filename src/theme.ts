// src/theme.ts
export const colors = {
  bg: '#050816',
  bgElevated: '#0b1220',
  card: '#111827',
  cardSoft: '#020617',
  border: '#1f2937',
  
  accent: '#f59e0b',
  accentSoft: '#7c2d12',
  accentAlt: '#8b5cf6',

  text: '#e5e7eb',
  textMuted: '#9ca3af',

  danger: '#f87171',
  dangerBorder: '#b91c1c',

  success: '#4ade80',
  warning: '#facc15',
};
  
export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
};
  
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700', color: colors.text },
  h2: { fontSize: 22, fontWeight: '600', color: colors.text },
  h3: { fontSize: 18, fontWeight: '600', color: colors.text },
  body: { fontSize: 14, color: colors.text },
  bodyMuted: { fontSize: 14, color: colors.textMuted },
  small: { fontSize: 12, color: colors.textMuted },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
};
