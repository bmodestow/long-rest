// src/styles/layout.ts
import { StyleSheet } from 'react-native';
import { colors, radii, spacing } from '../theme';

const layoutStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    backgroundColor: colors.card,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  errorText: {
    marginBottom: spacing.sm,
    fontSize: 13,
    color: colors.danger,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: spacing.sm,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.cardSoft,
  },
  primaryButton: {
    borderRadius: radii.md,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.accent,
  },
  primaryButtonText: {
    fontWeight: '600',
    color: colors.bg,
    fontSize: 15,
  },
  linkText: {
    marginTop: spacing.sm,
    fontSize: 13,
    color: colors.accentAlt,
    textAlign: 'center',
  },
});

export default layoutStyles;
