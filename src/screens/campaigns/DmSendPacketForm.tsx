// src/screens/campaigns/DmSendPacketForm.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    CampaignMember,
    fetchCampaignMembers,
} from '../../api/campaignMembers';
import {
    createPacketWithRecipients,
    EventPacketType,
} from '../../api/packets';
import { colors, radii, spacing } from '../../theme';
interface DmSendPacketFormProps {
  campaignId: string;
}

const PACKET_TYPES: EventPacketType[] = [
  'note',
  'xp',
  'loot',
  'secret',
  'announcement',
];

const DmSendPacketForm: React.FC<DmSendPacketFormProps> = ({ campaignId }) => {
  const [members, setMembers] = useState<CampaignMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [packetType, setPacketType] = useState<EventPacketType>('note');
  const [isPublishing, setIsPublishing] = useState(true);
  const [sending, setSending] = useState(false);

  // NEW: per-player selection
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);

  const loadMembers = useCallback(async () => {
    try {
      setLoadingMembers(true);
      const data = await fetchCampaignMembers(campaignId);
      setMembers(data);
    } catch (err: any) {
      console.error('Failed to load campaign members for packet form', err);
      Alert.alert(
        'Error',
        err?.message ?? 'Failed to load campaign members for packets.'
      );
    } finally {
      setLoadingMembers(false);
    }
  }, [campaignId]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const playerMembers = members.filter((m) => m.role === 'player');

  // Default selection: all players, when players first load
  useEffect(() => {
    if (!loadingMembers && playerMembers.length > 0 && selectedPlayerIds.length === 0) {
      setSelectedPlayerIds(playerMembers.map((m) => m.id));
    }
  }, [loadingMembers, playerMembers, selectedPlayerIds.length]);

  const togglePlayerSelection = (id: string) => {
    setSelectedPlayerIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedPlayerIds.length === playerMembers.length) {
      // Clear all
      setSelectedPlayerIds([]);
    } else {
      // Select all
      setSelectedPlayerIds(playerMembers.map((m) => m.id));
    }
  };

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Missing info', 'Please provide both a title and body.');
      return;
    }

    if (playerMembers.length === 0) {
      Alert.alert(
        'No players',
        'There are no player members in this campaign to send a packet to.'
      );
      return;
    }

    if (selectedPlayerIds.length === 0) {
      Alert.alert(
        'No recipients',
        'Select at least one player to send this packet to.'
      );
      return;
    }

    setSending(true);
    try {
      await createPacketWithRecipients({
        campaignId,
        type: packetType,
        title: title.trim(),
        body: body.trim(),
        isPublished: isPublishing,
        recipientCampaignMemberIds: selectedPlayerIds,
      });

      Alert.alert(
        'Packet sent',
        isPublishing
          ? 'Your packet has been sent to the selected players.'
          : 'Your packet has been saved as a draft for the selected players.'
      );

      // Reset form (but keep current player selections)
      setTitle('');
      setBody('');
      setPacketType('note');
      setIsPublishing(true);
    } catch (err: any) {
      console.error('Failed to create packet', err);
      Alert.alert(
        'Error',
        err?.message ?? 'Something went wrong while sending the packet.'
      );
    } finally {
      setSending(false);
    }
  };

  if (loadingMembers) {
    return (
      <View style={styles.centerRow}>
        <ActivityIndicator />
        <Text style={styles.helperText}>Loading players...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.helperText}>
        Choose a packet type, write the contents, then select which players should
        receive it.
      </Text>

      {playerMembers.length === 0 && (
        <Text style={styles.warningText}>
          There are currently no players in this campaign. Invite players before
          sending packets.
        </Text>
      )}

      {/* Packet Type Selector */}
      <View style={styles.typeRow}>
        {PACKET_TYPES.map((t) => {
          const isActive = t === packetType;
          return (
            <TouchableOpacity
              key={t}
              style={[styles.typeChip, isActive && styles.typeChipActive]}
              onPress={() => setPacketType(t)}
            >
              <Text
                style={[
                  styles.typeChipText,
                  isActive && styles.typeChipTextActive,
                ]}
              >
                {t.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Title */}
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="A whispered secret in the dark..."
      />

      {/* Body */}
      <Text style={styles.label}>Body</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        value={body}
        onChangeText={setBody}
        placeholder="Write the packet contents here..."
        multiline
      />

      {/* Player selection */}
      <View style={styles.recipientHeaderRow}>
        <Text style={styles.label}>Recipients</Text>
        <TouchableOpacity onPress={toggleSelectAll} disabled={playerMembers.length === 0}>
          <Text
            style={[
              styles.selectAllText,
              playerMembers.length === 0 && styles.selectAllTextDisabled,
            ]}
          >
            {selectedPlayerIds.length === playerMembers.length
              ? 'Clear all'
              : 'Select all'}
          </Text>
        </TouchableOpacity>
      </View>

      {playerMembers.length === 0 ? (
        <Text style={styles.noPlayersText}>No players to choose from.</Text>
      ) : (
        <View style={styles.playerList}>
          {playerMembers.map((player, index) => {
            const selected = selectedPlayerIds.includes(player.id);
            return (
              <TouchableOpacity
                key={player.id}
                style={styles.playerRow}
                onPress={() => togglePlayerSelection(player.id)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.checkbox,
                    selected && styles.checkboxChecked,
                  ]}
                />
                <Text style={styles.playerName}>
                  Player {index + 1} ({player.role})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Publish toggle */}
      <TouchableOpacity
        style={styles.publishToggle}
        onPress={() => setIsPublishing((prev) => !prev)}
      >
        <View
          style={[
            styles.checkboxSmall,
            isPublishing && styles.checkboxSmallChecked,
          ]}
        />
        <Text style={styles.publishLabel}>
          {isPublishing ? 'Send now (published)' : 'Save as draft (unpublished)'}
        </Text>
      </TouchableOpacity>

      {/* Send button */}
      <TouchableOpacity
        style={[
          styles.sendButton,
          (sending || selectedPlayerIds.length === 0 || playerMembers.length === 0) &&
            styles.sendButtonDisabled,
        ]}
        onPress={handleSend}
        disabled={sending || selectedPlayerIds.length === 0 || playerMembers.length === 0}
      >
        <Text style={styles.sendButtonText}>
          {sending ? 'Sending...' : 'Send Packet'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default DmSendPacketForm;

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.cardSoft,
  },
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  helperText: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 12,
    color: colors.accent,
    backgroundColor: '#451a03',
    borderRadius: 6,
    padding: 6,
    marginBottom: 8,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  typeChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  typeChipActive: {
    borderColor: colors.accent,
    backgroundColor: '#78350f',
  },
  typeChipText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  typeChipTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 4,
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.card,
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  recipientHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  selectAllText: {
    fontSize: 12,
    color: colors.accentAlt,
    fontWeight: '500',
  },
  selectAllTextDisabled: {
    color: colors.textMuted,
  },
  playerList: {
    marginBottom: 8,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    backgroundColor: colors.card,
  },
  checkboxChecked: {
    backgroundColor: colors.accentAlt,
    borderColor: colors.accentAlt,
  },
  playerName: {
    fontSize: 13,
    color: colors.text,
  },
  publishToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  checkboxSmall: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    backgroundColor: colors.card,
  },
  checkboxSmallChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  publishLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  sendButton: {
    marginTop: 4,
    borderRadius: radii.md,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: colors.accent,
  },
  sendButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
  sendButtonText: {
    color: '#000',
    fontWeight: '600',
  },
});
