// src/screens/campaigns/CampaignPacketsScreen.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { getInboxPackets, InboxPacket, markPacketRead } from '../../api/packets';
import { colors, radii, spacing } from '../../theme';

type Role = 'dm' | 'co_dm' | 'player';

interface CampaignPacketsScreenProps {
  campaignId: string;
  campaignName: string;
  role: Role;
}

const CampaignPacketsScreen: React.FC<CampaignPacketsScreenProps> = ({
  campaignId,
  campaignName,
  role,
}) => {
  const [packets, setPackets] = useState<InboxPacket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedPacketId, setExpandedPacketId] = useState<string | null>(null);

  const isDm = role === 'dm' || role === 'co_dm';

  const loadPackets = useCallback(async () => {
    try {
      setError(null);
      const data = await getInboxPackets(campaignId);
      setPackets(data);
    } catch (e: any) {
      console.error('Failed to load inbox packets', e);
      setError(e?.message ?? 'Failed to load packets.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [campaignId]);

  useEffect(() => {
    loadPackets();
  }, [loadPackets]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPackets();
  };

  const handleTogglePacket = async (item: InboxPacket) => {
    const alreadyExpanded = expandedPacketId === item.packet.id;
    setExpandedPacketId(alreadyExpanded ? null : item.packet.id);

    // Only players should mark packets as read;
    // DMs/co-DMs seeing all recipients shouldn't mutate read state.
    if (!item.recipient.has_read && !isDm) {
      // Optimistic update
      setPackets((prev) =>
        prev.map((p) =>
          p.packet.id === item.packet.id
            ? {
                ...p,
                recipient: {
                  ...p.recipient,
                  has_read: true,
                  read_at: new Date().toISOString(),
                },
              }
            : p
        )
      );

      try {
        await markPacketRead(item.packet.id);
      } catch (e) {
        console.warn('Failed to mark packet as read', e);
        // You could optionally revert optimistic update here if you care.
      }
    }
  };

  const renderPacketItem = ({ item }: { item: InboxPacket }) => {
    const { packet, recipient } = item;
    const isUnread = !recipient.has_read && !isDm;
    const isExpanded = expandedPacketId === packet.id;

    let dateLabel = '';
    try {
      const base = packet.visible_from ?? packet.created_at;
      dateLabel = new Date(base).toLocaleString();
    } catch {
      dateLabel = packet.visible_from ?? packet.created_at;
    }

    return (
      <TouchableOpacity
        style={[styles.card, isUnread && styles.cardUnread]}
        onPress={() => handleTogglePacket(item)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardHeaderLeft}>
            <MaterialCommunityIcons
                name={
                packet.type === 'xp'
                    ? 'star-four-points-outline'
                    : packet.type === 'loot'
                    ? 'treasure-chest'
                    : packet.type === 'secret'
                    ? 'eye-off-outline'
                    : packet.type === 'announcement'
                    ? 'bullhorn-outline'
                    : 'scroll'
                }
                size={18}
                color={colors.accent}
                style={{ marginRight: 8 }}
            />
  <Text style={styles.cardTitle} numberOfLines={1}>
    {packet.title}
  </Text>
</View>

          <View style={styles.cardHeaderRight}>
            {isUnread && <Text style={styles.unreadBadge}>NEW</Text>}
          </View>
        </View>

        <Text style={styles.metaText}>{dateLabel}</Text>

        {isExpanded && (
          <View style={styles.bodyContainer}>
            <Text style={styles.bodyText}>{packet.body}</Text>
          </View>
        )}

        {!isExpanded && (
          <Text style={styles.expandHint}>
            Tap to {isExpanded ? 'collapse' : 'view details'}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.helperText}>Loading packets...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Couldn&apos;t load packets</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>
        {isDm
          ? 'All packets for this campaign (by recipient).'
          : 'Packets your DM has sent to you.'}
      </Text>

      <FlatList
        data={packets}
        keyExtractor={(item) => item.recipient.id}
        renderItem={renderPacketItem}
        contentContainerStyle={
          packets.length === 0 ? styles.emptyContainer : undefined
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No packets yet. Check back after your DM sends something.
          </Text>
        }
      />

      {/* Debug line you can remove later if you want */}
      <Text style={styles.debugText}>
        Campaign: {campaignName} ({campaignId})
      </Text>
    </View>
  );
};

export default CampaignPacketsScreen;

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  headerText: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 8,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: 8,
    backgroundColor: colors.card,
  },
  cardUnread: {
    borderColor: colors.accentAlt,
    backgroundColor: '#1e1b4b',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardHeaderRight: {
    marginLeft: 8,
  },
  typeBadge: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.cardSoft,
    color: colors.textMuted,
    marginRight: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  unreadBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentAlt,
  },
  metaText: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  bodyContainer: {
    marginTop: 4,
  },
  bodyText: {
    fontSize: 14,
    color: colors.text,
  },
  expandHint: {
    marginTop: 4,
    fontSize: 11,
    color: colors.textMuted,
  },
  center: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helperText: {
    marginTop: 6,
    fontSize: 13,
    color: colors.textMuted,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.danger,
    marginBottom: 4,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 12,
    color: colors.dangerBorder,
    textAlign: 'center',
  },
  emptyContainer: {
    paddingVertical: 16,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
  debugText: {
    marginTop: 4,
    fontSize: 10,
    color: colors.textMuted,
  },
});
