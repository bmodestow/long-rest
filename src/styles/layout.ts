// src/styles/layout.ts
import { StyleSheet } from 'react-native';
import { colors, radii, shadows, spacing, typography } from '../theme';

const layoutStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.lg,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    backgroundColor: colors.card,
    ...shadows.sm,
  },
  title: {
    ...typography.h2,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.small,
    marginBottom: spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: spacing.md,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.cardSoft,
  },
  primaryButton: {
    marginTop: spacing.sm,
    borderRadius: radii.md,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.accent,
  },
  primaryButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 15,
  },
  linkText: {
    marginTop: spacing.md,
    textAlign: 'center',
    color: colors.accentAlt,
    fontSize: 13,
  },
  errorText: {
    color: colors.danger,
    marginBottom: spacing.sm,
    fontSize: 13,
  },
});

export default layoutStyles;
