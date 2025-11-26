import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import {
  createCampaign,
  fetchMyCampaigns,
  joinCampaignByCode,
  MyCampaign,
} from '../../api/campaigns';
import { supabase } from '../../api/supabaseClient';

const CampaignListScreen: React.FC = () => {
    const [campaigns, setCampaigns] = useState<MyCampaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [showCreate, setShowCreate] = useState(false);
    const [showJoin, setShowJoin] = useState(false);

    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [joinCode, setJoinCode] = useState('');

    const [actionLoading, setActionLoading] = useState(false);

    const loadCampaigns = useCallback(async () => {
        try {
            if (!refreshing) setLoading(true);
            const data = await fetchMyCampaigns();
            setCampaigns(data);
        } catch (err: any) {
            Alert.alert('Error', err.message ?? 'Failed to load campaigns.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [refreshing]);

    useEffect(() => {
        loadCampaigns();
    }, [loadCampaigns]);

    const onRefresh = () => {
        setRefreshing(true);
        loadCampaigns();
    }

    const handleCreate = async () => {
        if (!newName.trim()) {
            Alert.alert('Missing name', 'Please enter a campaign name.');
            return;
        }

        setActionLoading(true);
        try {
            await createCampaign(newName.trim(), newDescription.trim() || undefined);
            setNewName('');
            setNewDescription('');
            setShowCreate(false);
            await loadCampaigns();
        } catch (err: any) {
            Alert.alert('Error creating campaign', err.message ?? 'Something went wrong.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleJoin = async () => {
        if (!joinCode.trim()) {
            Alert.alert('Missing code', 'Please enter an invite code.');
            return;
        }

        setActionLoading(true);
        try {
            await joinCampaignByCode(joinCode.trim().toUpperCase());
            setJoinCode('');
            setShowJoin(false);
            await loadCampaigns();
        } catch (err: any) {
            Alert.alert('Error joing campaign', err.message ?? 'Something went wrong.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const renderItem = ({ item }: { item: MyCampaign }) => {
        const roleLabel = 
            item.member_role === 'dm'
                ? 'DM'
                : item.member_role === 'co_dm'
                ? 'Co-DM'
                : 'Player';
        
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleBadgeText}>{roleLabel}</Text>
                    </View>
                </View>
                {item.description ? (
                    <Text style={styles.cardDescription} numberOfLines={2}>
                        {item.description}
                    </Text>
                ) : (
                    <Text style={styles.cardDescriptionEmpty}>No description yet.</Text>
                )}
            </View>
        );
    };

    return (
    <View style={styles.container}>
      {/* Top actions */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>My Campaigns</Text>
        <Button title="Log out" onPress={handleLogout} />
      </View>

      <View style={styles.actionsRow}>
        <View style={styles.actionsButton}>
          <Button
            title={showCreate ? 'Cancel' : 'New Campaign'}
            onPress={() => {
              setShowCreate((prev) => !prev);
              setShowJoin(false);
            }}
          />
        </View>
        <View style={styles.actionsButton}>
          <Button
            title={showJoin ? 'Cancel' : 'Join by Code'}
            onPress={() => {
              setShowJoin((prev) => !prev);
              setShowCreate(false);
            }}
          />
        </View>
      </View>

      {/* Create campaign form */}
      {showCreate && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Create a campaign</Text>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={newName}
            onChangeText={setNewName}
            placeholder="Curse of Strahd – Group A"
          />
          <Text style={styles.label}>Description (optional)</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={newDescription}
            onChangeText={setNewDescription}
            placeholder="Short description of this campaign"
            multiline
          />
          <Button
            title={actionLoading ? 'Creating...' : 'Create campaign'}
            onPress={handleCreate}
            disabled={actionLoading}
          />
        </View>
      )}

      {/* Join by code form */}
      {showJoin && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Join a campaign</Text>
          <Text style={styles.label}>Invite code</Text>
          <TextInput
            style={styles.input}
            value={joinCode}
            onChangeText={setJoinCode}
            autoCapitalize="characters"
            placeholder="ABC12345"
          />
          <Button
            title={actionLoading ? 'Joining...' : 'Join campaign'}
            onPress={handleJoin}
            disabled={actionLoading}
          />
        </View>
      )}

      {/* Campaign list */}
      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={campaigns}
          keyExtractor={(item) => item.campaign_id}
          renderItem={renderItem}
          contentContainerStyle={
            campaigns.length === 0 ? styles.emptyListContainer : undefined
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              You don’t have any campaigns yet. Create one or join with a code.
            </Text>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  actionsButton: {
    flex: 1,
  },
  formContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  label: {
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  multilineInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    paddingHorizontal: 24,
  },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    paddingRight: 8,
  },
  roleBadge: {
    backgroundColor: '#333',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  roleBadgeText: {
    color: '#fff',
    fontSize: 12,
  },
  cardDescription: {
    color: '#444',
  },
  cardDescriptionEmpty: {
    color: '#999',
    fontStyle: 'italic',
  },
});

export default CampaignListScreen;