// src/screens/campaigns/CampaignPacketsScreen.tsx
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
            <Text style={styles.typeBadge}>{packet.type.toUpperCase()}</Text>
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
    color: '#666',
    marginBottom: 8,
  },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#fafafa',
  },
  cardUnread: {
    borderColor: '#8b5cf6',
    backgroundColor: '#f5f3ff',
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
    borderRadius: 8,
    backgroundColor: '#eee',
    marginRight: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  unreadBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7c3aed',
  },
  metaText: {
    fontSize: 12,
    color: '#777',
    marginBottom: 4,
  },
  bodyContainer: {
    marginTop: 4,
  },
  bodyText: {
    fontSize: 14,
    color: '#333',
  },
  expandHint: {
    marginTop: 4,
    fontSize: 11,
    color: '#999',
  },
  center: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helperText: {
    marginTop: 6,
    fontSize: 13,
    color: '#666',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#b91c1c',
    marginBottom: 4,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 12,
    color: '#991b1b',
    textAlign: 'center',
  },
  emptyContainer: {
    paddingVertical: 16,
  },
  emptyText: {
    fontSize: 13,
    color: '#777',
    textAlign: 'center',
  },
  debugText: {
    marginTop: 4,
    fontSize: 10,
    color: '#aaa',
  },
});
