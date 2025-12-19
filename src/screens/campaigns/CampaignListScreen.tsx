// src/screens/campaigns/CampaignListScreen.tsx
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Campaign, fetchCampaigns } from '../../api/campaigns';
import { PressableScale } from '../../components/motion/PressableScale';
import { ScreenContainer } from '../../components/ScreenContainer';
import type { AppStackParamList } from '../../navigation/AppNavigator';
import { colors, radii, spacing } from '../../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'CampaignList'>;

const CampaignListScreen: React.FC<Props> = ({ navigation }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const data = await fetchCampaigns();
      setCampaigns(data);
    } catch (e) {
      console.error('fetchCampaigns error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const renderItem = ({ item }: { item: Campaign }) => (
    <PressableScale
      style={styles.card}
      onPress={() =>
        navigation.navigate('CampaignDetail', {
          campaignId: item.id,
          name: item.name,
          description: item.description,
          memberRole: item.member_role,
        })
      }
    >
      <View style={styles.cardHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons
            name="dice-d20"
            size={18}
            color={colors.accent}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.cardTitle}>{item.name}</Text>
        </View>

        <View style={styles.rolePill}>
          <Feather
            name={item.member_role === 'player' ? 'user' : 'shield'}
            size={12}
            color={colors.text}
          />
          <Text style={styles.rolePillText}>
            {item.member_role === 'dm'
              ? 'DM'
              : item.member_role === 'co_dm'
              ? 'Co-DM'
              : 'Player'}
          </Text>
        </View>
      </View>

      {item.description ? (
        <Text style={styles.cardBody} numberOfLines={2}>
          {item.description}
        </Text>
      ) : (
        <Text style={styles.cardBodyMuted}>No description yet.</Text>
      )}
    </PressableScale>
  );

  if (loading) {
    return (
      <ScreenContainer center>
        <ActivityIndicator color={colors.accent} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {campaigns.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            No campaigns yet. Create one to get started.
          </Text>
        </View>
      ) : (
        <FlatList
          data={campaigns}
          keyExtractor={(c) => c.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => (
            <View style={{ height: spacing.sm }} />
          )}
          contentContainerStyle={{ paddingVertical: spacing.sm }}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    backgroundColor: colors.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  cardBody: {
    fontSize: 13,
    color: colors.textMuted,
  },
  cardBodyMuted: {
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.cardSoft,
  },
  rolePillText: {
    marginLeft: 4,
    fontSize: 11,
    color: colors.text,
    fontWeight: '600',
  },
});

export default CampaignListScreen;
