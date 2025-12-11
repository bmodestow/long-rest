import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Character, fetchCharactersForCampaign } from '../../api/characters';
import { ScreenContainer } from '../../components/ScreenContainer';
import { colors, radii, spacing } from '../../theme';

type Role = 'dm' | 'co_dm' | 'player';

interface CampaignCharactersScreenProps {
  campaignId: string;
  role: Role;
}

const CampaignCharactersScreen: React.FC<CampaignCharactersScreenProps> = ({
  campaignId,
  role,
}) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isDm = role === 'dm' || role === 'co_dm';

  const loadCharacters = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await fetchCharactersForCampaign(campaignId);
      setCharacters(data);
    } catch (e: any) {
      console.error('Failed to load characters', e);
      setError(e?.message ?? 'Failed to load characters.');
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  const renderItem = ({ item }: { item: Character }) => {
    const isNpc = item.is_npc;
    const levelLabel =
      item.level != null ? `Level ${item.level}` : 'Level Unknown';

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          {/* Portrait / Icon */}
          <View style={styles.portraitWrapper}>
            {item.portrait_url ? (
              <Image
                source={{ uri: item.portrait_url }}
                style={styles.portrait}
              />
            ) : (
              <View style={styles.portraitFallback}>
                <MaterialCommunityIcons
                  name={isNpc ? 'drama-masks' : 'account'}
                  size={22}
                  color={colors.accent}
                />
              </View>
            )}
          </View>

          {/* Main Info */}
          <View style={styles.mainInfo}>
            <Text style={styles.name}>{item.name}</Text>

            <View style={styles.metaRow}>
              {/* PC/NPC pill */}
              <View style={[styles.pill, isNpc ? styles.npcPill : styles.pcPill]}>
                <Text style={styles.pillText}>{isNpc ? 'NPC' : 'PC'}</Text>
              </View>

              {/* Class + level */}
              {item.class_name ? (
                <Text style={styles.metaText}>
                  {item.class_name} • {levelLabel}
                </Text>
              ) : (
                <Text style={styles.metaText}>{levelLabel}</Text>
              )}
            </View>

            {/* Player attribution */}
            {!isNpc && item.player_name && (
              <View style={styles.metaRow}>
                <Feather
                  name="user"
                  size={11}
                  color={colors.textMuted}
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.metaText}>Played by {item.player_name}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Notes Preview */}
        {item.notes ? (
          <Text style={styles.notes} numberOfLines={2}>
            {item.notes}
          </Text>
        ) : isDm ? (
          <Text style={styles.notesPlaceholder}>No notes yet.</Text>
        ) : null}
      </View>
    );
  };

  if (loading) {
    return (
      <ScreenContainer center>
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.helperText}>Loading characters...</Text>
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer center>
        <View style={styles.center}>
          <Text style={styles.errorTitle}>Couldn&apos;t load characters</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (characters.length === 0) {
    return (
      <ScreenContainer center>
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            No characters have been added to this campaign yet.
          </Text>
          {isDm && (
            <Text style={styles.helperText}>
              Add tools here for creating PCs and NPCs.
            </Text>
          )}
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <FlatList
        style={{ flex: 1 }}
        data={characters}
        keyExtractor={(c) => c.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        contentContainerStyle={{ paddingBottom: spacing.lg }}
      />
    </ScreenContainer>
  );
};

export default CampaignCharactersScreen;

const styles = StyleSheet.create({
  center: {
    paddingVertical: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helperText: {
    marginTop: 8,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
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
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    backgroundColor: colors.card,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  portraitWrapper: {
    marginRight: spacing.md,
  },
  portrait: {
    width: 48,
    height: 48,
    borderRadius: 999,
  },
  portraitFallback: {
    width: 48,
    height: 48,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  metaText: {
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 6,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
  },
  pcPill: {
    borderColor: colors.accentAlt,
    backgroundColor: '#1e1b4b',
  },
  npcPill: {
    borderColor: colors.accentSoft,
    backgroundColor: '#451a03',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
  },
  notes: {
    marginTop: 4,
    fontSize: 13,
    color: colors.text,
  },
  notesPlaceholder: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
