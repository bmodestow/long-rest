// src/screens/campaigns/PacketDetailScreen.tsx
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import type { AppStackParamList } from '../../navigation/AppNavigator';
import { colors, radii, spacing } from '../../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'PacketDetail'>;

const PacketDetailScreen: React.FC<Props> = ({ route }) => {
  const {
    campaignId,
    packetId,
    title,
    body,
    type,
    createdAt,
    senderName,
    isRead,
  } = route.params;

  const typeLabel = type.toUpperCase();
  const created = new Date(createdAt);

  const typeIconName: string =
    type === 'xp'
      ? 'star-four-points-outline'
      : type === 'loot'
      ? 'treasure-chest'
      : type === 'secret'
      ? 'eye-off-outline'
      : type === 'announcement'
      ? 'bullhorn-outline'
      : 'scroll';

  return (
    <ScreenContainer scroll>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <MaterialCommunityIcons
              name={typeIconName as any}
              size={24}
              color={colors.accent}
              style={{ marginRight: spacing.sm }}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.typeText}>{typeLabel}</Text>
            </View>
          </View>

          {isRead === false && (
            <View style={styles.unreadPill}>
              <Feather
                name="mail"
                size={12}
                color={colors.cardSoft}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.unreadPillText}>Unread</Text>
            </View>
          )}
        </View>

        {/* Meta */}
        <View style={styles.metaRow}>
          {senderName ? (
            <View style={styles.metaItem}>
              <Feather
                name="user"
                size={12}
                color={colors.textMuted}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.metaText}>From {senderName}</Text>
            </View>
          ) : null}
          <View style={styles.metaItem}>
            <Feather
              name="clock"
              size={12}
              color={colors.textMuted}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.metaText}>{created.toLocaleString()}</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Body */}
        <View>
          <Text style={styles.bodyText}>{body}</Text>
        </View>
      </View>

      {/* Debug/Meta text */}
      <Text style={styles.debugText}>
        Campaign ID: {campaignId} - Packet ID: {packetId}
      </Text>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    backgroundColor: colors.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  typeText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  unreadPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.accentAlt,
  },
  unreadPillText: {
    fontSize: 11,
    color: colors.cardSoft,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
    marginBottom: 2,
  },
  metaText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  bodyText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  debugText: {
    marginTop: spacing.sm,
    fontSize: 10,
    color: colors.textMuted,
  },
});

export default PacketDetailScreen;
