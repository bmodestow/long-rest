import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Polygon, Rect } from 'react-native-svg';
import { colors, radii, spacing } from '../theme';

interface LongRestLogoSvgProps {
  size?: number;          // overall logo width/height in px
  showText?: boolean;     // whether to render the "Long Rest" text lockup
  subtitle?: string;      // optional subtitle text
}

const LongRestLogoSvg: React.FC<LongRestLogoSvgProps> = ({
  size = 96,
  showText = true,
  subtitle = 'Campfire campaign manager',
}) => {
  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.badgeWrapper,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        <Svg width={size} height={size} viewBox="0 0 100 100">
          {/* Outer circle */}
          <Circle cx="50" cy="50" r="48" fill={colors.card} stroke={colors.accent} strokeWidth="2" />

          {/* Night sky gradient-ish: just a darker top overlay */}
          <Path
            d="M2 2h96v60H2z"
            fill={colors.bg}
            opacity={0.9}
          />

          {/* Moon (simple circle in upper right) */}
          <Circle cx="72" cy="20" r="7" fill={colors.accentAlt} opacity={0.9} />
          <Circle cx="70" cy="19" r="7" fill={colors.bg} opacity={0.75} />

          {/* Ground */}
          <Rect
            x="8"
            y="62"
            width="84"
            height="8"
            fill={colors.cardSoft}
          />

          {/* Left pine tree */}
          <Polygon
            points="28,60 20,42 36,42"
            fill={colors.textMuted}
            opacity={0.85}
          />
          <Rect
            x="26"
            y="60"
            width="4"
            height="7"
            fill={colors.textMuted}
            opacity={0.8}
          />

          {/* Right pine tree */}
          <Polygon
            points="40,60 34,46 46,46"
            fill={colors.textMuted}
            opacity={0.6}
          />
          <Rect
            x="38"
            y="60"
            width="3"
            height="6"
            fill={colors.textMuted}
            opacity={0.6}
          />

          {/* Campfire logs */}
          <Path
            d="M44 66 L56 66"
            stroke={colors.border}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <Path
            d="M46 68 L54 64"
            stroke={colors.border}
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Flame */}
          <Path
            d="M50 62
               C 46 57, 46 52, 49 47
               C 50.5 44, 52 42, 50 38
               C 54 42, 55.5 46, 55 50
               C 54.5 54, 53 57, 50 62 Z"
            fill={colors.accent}
          />
          <Path
            d="M50 60
               C 48 57, 48.5 54, 49.5 51
               C 50.5 49, 51 47.5, 50 45
               C 52 47.5, 53 50, 52.5 52.5
               C 52 55, 51 57, 50 60 Z"
            fill="#fde68a"
            opacity={0.9}
          />
        </Svg>
      </View>

      {showText && (
        <View style={styles.textBlock}>
          <Text style={styles.title}>Long Rest</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <View style={styles.underlineRow}>
            <View style={styles.underlineShort} />
            <View style={styles.underlineDot} />
            <View style={styles.underlineLong} />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginBottom: spacing.xl ?? 24,
  },
  badgeWrapper: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radii.xl,
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

export default LongRestLogoSvg;
