import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    StyleSheet
} from 'react-native';
import { getInboxPackets, InboxPacket, markPacketRead } from "../../api/packets";
import { formatDateTime } from "../../utils/formatDate";

type Role = 'dm' | 'co_dm' | 'player';

interface CampaignPacketsScreenProps {
    campaignId: string;
    campaignName: string;
    role: Role;
    // If I'm using React Navigation, I can adapt this to use route/navigation instead
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
    const [selectedPacketId, setSelectedPacketId] = useState<string | null>(null);

    const loadPackets = useCallback(async () => {
        try {
            setError(null);
            const data = await getInboxPackets(campaignId);
            setPackets(data);
        } catch (e: any) {
            setError(e.message ?? 'Failed to load packest');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [loadPackets]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadPackets();
    };

    const handleOpenPacket = async (packet: InboxPacket) => {
        setSelectedPacketId(packet.packet_id);

        // Optimistic read marking
        if (!packet.recipient.has_read) {
            setPackets((prev) => 
                prev.map((p) => 
                    p.packet_id === packet.packet_id
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
                await markPacketRead(packet.packet_id);
            } catch (e) {
                console.warn('Failed to mark packet as read', e);
                // If I want, I could revert optimistic state here.
            }
        }
    };

    const renderPacketItem = ({ item }: { item: InboxPacket }) => {
        const { packet, recipient } = item;
        const isUnread = !recipient.has_read;

        let dateLabel = '';
        try {
            dateLabel = format(new Date(packet.visible_from ?? packet.created_at), 'PPp');
        } catch {
            dateLabel = packet.visible_from ?? packet.created_at;
        }

        return (
            <TouchableOpacity 
                style={[styles.card, isUnread && styles.cardUnread]}
                onPress={() => handleOpenPacket(item)}
            >
                <View style={styles.row}>
                    <Text style={styles.typeBadge}>{packet.type.toUpperCase()}</Text>
                    {isUnread && <Text style={styles.unreadBadge}>NEW</Text>}
                </View>
                <Text style={styles.title}>{packet.title}</Text>
                <Text style={styles.metaText}>{dateLabel}</Text>
                {selectedPacketId === packet.id && (
                    <View style={styles.bodyContainer}>
                        <Text style={styles.bodyText}>{packet.body}</Text>
                    </View>
                )}
            </TouchableOpacity>    
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.center}>
                <ActivityIndicator />
                <Text style={styles.loadingText}>Loading packets...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>Failed to load packets.</Text>
                <Text style={styles.errorSubText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>{campaignName} - Packets</Text>
            <Text style={styles.subheader}>
                {role === 'dm' || role === 'co_dm'
                    ? 'You can see all packets for this campaign.'
                    : 'Packets sent to you by your DM.'}
            </Text>

            <FlatList
                data={packets}
                keyExtractor={(item) => item.recipient.id}
                renderItem={renderPacketItem}
                contentContainerStyle={packets.length === 0 ? styles.emptyContainer : undefined}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No packets yet. Check back after your DM sends something.</Text>
                }
            />
        </View>
    );
};

export default CampaignPacketsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        gap: 8,
    },
    header: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom:4,
    },
    subheader: {
        fontSize: 14,
        color: '#999',
        marginBottom: 12,
    },
    card: {
        backgroundColor: '#1d1d24',
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#333',
    },
    cardUnread: {
        borderColor: '#c084fc'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    typeBadge: {
        fontSize: 11,
        fontWeight: '700',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        backgroundColor: '#2f2f3a',
        textTransform: 'uppercase',
    },
    unreadBadge: {
        fontSize: 11,
        fontWeight: '700',
        color: '#c084fc',
    },
    title: {
        marginTop: 6,
        fontSize: 16,
        fontWeight: '600',
    },
    metaText: {
        marginTop: 2,
        fontSize: 12,
        color: '#aaa',
    },
    bodyContainer: {
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#333',
        paddingTop: 8,
    },
    bodyText: {
        fontSize: 14,
        color: '#ddd',
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    loadingText: {
        marginTop: 8,
        color: '#999'
    },
    errorText: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
        color: '#fca5a5',
    },
    errorSubText: {
        fontSize: 12,
        color: '#f97373',
        textAlign: 'center',
    },
    emptyContainer: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    emptyText: {
        fontSize: 14,
        color: '#777',
        textAlign: 'center',
    },
});