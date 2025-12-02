// src/components/LongRestLogo.tsx
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';

interface LongRestLogoProps {
  size?: number; // overall badge size
}

const LongRestLogo: React.FC<LongRestLogoProps> = ({ size = 72 }) => {
  const iconSize = size * 0.5;

  return (
    <View style={styles.wrapper}>
      {/* Badge */}
      <View style={[styles.badge, { width: size, height: size, borderRadius: size / 2 }]}>
        {/* Moon */}
        <View style={styles.moonContainer}>
          <Feather name="moon" size={size * 0.28} color={colors.accentAlt} />
        </View>

        {/* Trees (background) */}
        <View style={styles.treesRow}>
          <MaterialCommunityIcons
            name="pine-tree"
            size={size * 0.26}
            color={colors.textMuted}
            style={{ opacity: 0.7 }}
          />
          <MaterialCommunityIcons
            name="pine-tree"
            size={size * 0.22}
            color={colors.textMuted}
            style={{ opacity: 0.5, marginLeft: -8 }}
          />
        </View>

        {/* Campfire (foreground) */}
        <View style={styles.campfireContainer}>
          <MaterialCommunityIcons
            name="campfire"
            size={iconSize}
            color={colors.accent}
          />
        </View>

        {/* Ground line */}
        <View style={styles.groundLine} />
      </View>

      {/* Text */}
      <View style={styles.textBlock}>
        <Text style={styles.title}>Long Rest</Text>
        <Text style={styles.subtitle}>Campfire campaign manager</Text>

        {/* Decorative underline */}
        <View style={styles.underlineRow}>
          <View style={styles.underlineShort} />
          <View style={styles.underlineDot} />
          <View style={styles.underlineLong} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginBottom: spacing.xl ?? 24,
  },
  badge: {
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.card,
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: spacing.sm,
    overflow: 'hidden',
  },
  moonContainer: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    opacity: 0.8,
  },
  treesRow: {
    position: 'absolute',
    bottom: spacing.md + 8,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  campfireContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  groundLine: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    height: 2,
    borderRadius: 999,
    backgroundColor: colors.border,
  },
  textBlock: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 1,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textMuted,
  },
  underlineRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  underlineShort: {
    width: 16,
    height: 2,
    borderRadius: 999,
    backgroundColor: colors.accentAlt,
    marginRight: 4,
  },
  underlineDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
    marginRight: 4,
  },
  underlineLong: {
    width: 32,
    height: 2,
    borderRadius: 999,
    backgroundColor: colors.accentAlt,
  },
});

export default LongRestLogo;
