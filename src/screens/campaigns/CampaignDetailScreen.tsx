import { Feather } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Button,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { deleteCampaign, updateCampaign } from '../../api/campaigns';
import { CampaignInvite, createInvite, fetchInvites } from '../../api/invites';
import { createSession, fetchSessions, Session } from '../../api/sessions';
import type { AppStackParamList } from '../../navigation/AppNavigator';
import { colors, radii, spacing } from '../../theme';
import { formatDateTime } from '../../utils/formatDate';
import CampaignPacketsScreen from './CampaignPacketsScreen';
import DmSendPacketForm from './DmSendPacketForm';

type Props = NativeStackScreenProps<AppStackParamList, 'CampaignDetail'>;

type CampaignTabParamList = {
  Overview: undefined;
  Sessions: undefined;
  Packets: undefined;
  Recaps: undefined;
  DmTools: undefined;
};

const Tab = createMaterialTopTabNavigator<CampaignTabParamList>();

const CampaignDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { campaignId, name, memberRole, description } = route.params;

  // Sessions state
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  const [showCreateSession, setShowCreateSession] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDateTime, setSessionDateTime] = useState('');
  const [sessionLocation, setSessionLocation] = useState('');
  const [sessionActionLoading, setSessionActionLoading] = useState(false);

  // Invites state
  const [invites, setInvites] = useState<CampaignInvite[]>([]);
  const [invitesLoading, setInvitesLoading] = useState(true);
  const [inviteActionLoading, setInviteActionLoading] = useState(false);

  // Settings state
  const [editingName, setEditingName] = useState(name);
  const [editingDescription, setEditingDescription] = useState(description ?? '');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const isDm = memberRole === 'dm' || memberRole === 'co_dm';

  useEffect(() => {
    navigation.setOptions({
        title: editingName || name,
        headerStyle: { backgroundColor: colors.bgElevated },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
        headerShadowVisible: false // hides the grey bottom border on iOS
    });
  }, [navigation, editingName, name]);

  const loadSessions = async () => {
    try {
      setSessionsLoading(true);
      const data = await fetchSessions(campaignId);
      setSessions(data);
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.message ?? 'Failed to load sessions for this campaign.'
      );
    } finally {
      setSessionsLoading(false);
    }
  };

  const loadInvites = async () => {
    if (!isDm) {
      setInvitesLoading(false);
      return;
    }

    try {
      setInvitesLoading(true);
      const data = await fetchInvites(campaignId);
      setInvites(data);
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.message ?? 'Failed to load invite codes for this campaign.'
      );
    } finally {
      setInvitesLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
    loadInvites();
  }, [campaignId]);

  const roleLabel =
    memberRole === 'dm'
      ? 'Dungeon Master'
      : memberRole === 'co_dm'
      ? 'Co-DM'
      : 'Player';

  const handleCreateSession = async () => {
    if (!sessionTitle.trim() || !sessionDateTime.trim()) {
      Alert.alert('Missing info', 'Please enter at least a title and date/time.');
      return;
    }

    const raw = sessionDateTime.trim();

    // Expect format: YYYY-MM-DD HH:MM (24h)
    const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/);

    if (!match) {
      Alert.alert('Invalid date/time', 'Use this format: 2025-12-01 19:00');
      return;
    }

    const [, yearStr, monthStr, dayStr, hourStr, minuteStr] = match;
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);
    const hour = Number(hourStr);
    const minute = Number(minuteStr);

    if (
      Number.isNaN(year) ||
      Number.isNaN(month) ||
      Number.isNaN(day) ||
      Number.isNaN(hour) ||
      Number.isNaN(minute)
    ) {
      Alert.alert('Invalid date/time', 'Use this format: 2025-12-01 19:00');
      return;
    }

    // Create a UTC date so it's unambiguous for Postgres
    const parsed = new Date(Date.UTC(year, month - 1, day, hour, minute));
    const iso = parsed.toISOString();

    setSessionActionLoading(true);
    try {
      await createSession(
        campaignId,
        sessionTitle.trim(),
        iso,
        sessionLocation.trim() || undefined
      );
      setSessionTitle('');
      setSessionDateTime('');
      setSessionLocation('');
      setShowCreateSession(false);
      await loadSessions();
    } catch (err: any) {
      Alert.alert(
        'Error creaing session',
        err?.message ?? 'Something went wrong while creating the session.'
      );
    } finally {
      setSessionActionLoading(false);
    }
  };

  const handleCreateInvite = async () => {
    if (!isDm) return;

    setInviteActionLoading(true);
    try {
      const invite = await createInvite(campaignId);
      Alert.alert(
        'Invite created!',
        `Share this code with your players:\n\n${invite.code}`
      );
      await loadInvites();
    } catch (err: any) {
      Alert.alert(
        'Error creating invite',
        err?.message ?? 'Something went wrong while creating the invite.'
      );
    } finally {
      setInviteActionLoading(false);
    }
  };

  const renderInviteStatus = (invite: CampaignInvite) => {
    if (invite.used_by_user_id) {
      return `Used at ${invite.used_at ? formatDateTime(invite.used_at) : ''}`.trim();
    }
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return 'Expired';
    }
    return 'Active';
  };

  const handleSaveSettings = async () => {
    if (!editingName.trim()) {
      Alert.alert('Missing name', 'Campaign name cannot be empty.');
      return;
    }

    setSettingsLoading(true);
    try {
      const updated = await updateCampaign(campaignId, {
        name: editingName.trim(),
        description: editingDescription.trim() || null,
      });

      Alert.alert('Saved', 'Campaign settings updated.');
    } catch (err: any) {
      Alert.alert(
        'Error:',
        err?.message ?? 'Failed to update campaign settings.'
      );
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleDeleteCampaign = () => {
    Alert.alert(
      'Delete campaign',
      'Are you sure you want to delte this campaign? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleteLoading(true);
            try {
              await deleteCampaign(campaignId);
              Alert.alert('Deleted', 'Campaign has been deleted.');
              navigation.goBack();
            } catch (err: any) {
              Alert.alert(
                'Error',
                err?.message ?? 'Failed to delete campaign.'
              );
            } finally {
              setDeleteLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{editingName || name}</Text>
        <Text style={styles.subtitle}>{roleLabel}</Text>
      </View>

      <Tab.Navigator
        screenOptions={({ route }) => ({
            tabBarScrollEnabled: true,
            tabBarIndicatorStyle: { backgroundColor: colors.accent },
            tabBarStyle: { backgroundColor: colors.bgElevated },
            tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '600',
                textTransform: 'none',
            },
            tabBarActiveTintColor: colors.accent,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarIcon: ({ color }) => {
                switch (route.name) {
                    case 'Overview':
                        return <Feather name="book-open" size={16} color={color} />;
                    case 'Sessions':
                        return <Feather name="calendar" size={16} color={color} />;
                    case 'Packets':
                        return <Feather name="mail" size={16} color={color} />;
                    case 'Recaps':
                        return <Feather name="file-text" size={16} color={color} />;
                    case 'DmTools':
                        return <Feather name="settings" size={16} color={color} />;
                    default:
                        return null;
                }
            },
            tabBarShowIcon: true,
        })}
        >

        <Tab.Screen name="Overview">
          {() => (
            <OverviewTab
              description={
                (editingDescription || description || '').trim() || undefined
              }
            />
          )}
        </Tab.Screen>

        <Tab.Screen name="Sessions">
          {() => (
            <SessionsTab
              isDm={isDm}
              sessions={sessions}
              sessionsLoading={sessionsLoading}
              showCreateSession={showCreateSession}
              setShowCreateSession={setShowCreateSession}
              sessionTitle={sessionTitle}
              setSessionTitle={setSessionTitle}
              sessionDateTime={sessionDateTime}
              setSessionDateTime={setSessionDateTime}
              sessionLocation={sessionLocation}
              setSessionLocation={setSessionLocation}
              sessionActionLoading={sessionActionLoading}
              handleCreateSession={handleCreateSession}
              navigation={navigation}
              campaignId={campaignId}
              memberRole={memberRole}
            />
          )}
        </Tab.Screen>

        <Tab.Screen name="Packets">
          {() => (
            <View style={styles.tabContainer}>
              <CampaignPacketsScreen
                campaignId={campaignId}
                campaignName={editingName || name}
                role={memberRole}
              />
            </View>
          )}
        </Tab.Screen>

        <Tab.Screen name="Recaps">
          {() => <RecapsTab />}
        </Tab.Screen>

        <Tab.Screen
          name="DmTools"
          options={{ title: 'DM Tools' }}
        >
          {() => (
            <DmToolsTab
              campaignId={campaignId}
              isDm={isDm}
              editingName={editingName}
              setEditingName={setEditingName}
              editingDescription={editingDescription}
              setEditingDescription={setEditingDescription}
              settingsLoading={settingsLoading}
              handleSaveSettings={handleSaveSettings}
              deleteLoading={deleteLoading}
              handleDeleteCampaign={handleDeleteCampaign}
              invitesLoading={invitesLoading}
              invites={invites}
              inviteActionLoading={inviteActionLoading}
              handleCreateInvite={handleCreateInvite}
              renderInviteStatus={renderInviteStatus}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>

      <Text style={styles.debugText}>Campaign ID: {campaignId}</Text>
    </View>
  );
};

/* ---------- TAB COMPONENTS ---------- */

interface OverviewTabProps {
  description?: string;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ description }) => {
  return (
    <ScrollView style={styles.tabContainer}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <Text style={styles.sectionBody}>
          {description ||
            'This is where campaign description, party info, and quick notes will go. Will hook up to the DB Later'}
        </Text>
      </View>
    </ScrollView>
  );
};

interface SessionsTabProps {
  isDm: boolean;
  sessions: Session[];
  sessionsLoading: boolean;
  showCreateSession: boolean;
  setShowCreateSession: React.Dispatch<React.SetStateAction<boolean>>;
  sessionTitle: string;
  setSessionTitle: (v: string) => void;
  sessionDateTime: string;
  setSessionDateTime: (v: string) => void;
  sessionLocation: string;
  setSessionLocation: (v: string) => void;
  sessionActionLoading: boolean;
  handleCreateSession: () => void;
  navigation: Props['navigation'];
  campaignId: string;
  memberRole: string;
}

const SessionsTab: React.FC<SessionsTabProps> = ({
  isDm,
  sessions,
  sessionsLoading,
  showCreateSession,
  setShowCreateSession,
  sessionTitle,
  setSessionTitle,
  sessionDateTime,
  setSessionDateTime,
  sessionLocation,
  setSessionLocation,
  sessionActionLoading,
  handleCreateSession,
  navigation,
  campaignId,
  memberRole,
}) => {
  return (
    <ScrollView style={styles.tabContainer}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sessions</Text>

        {isDm && (
          <View style={styles.section}>
            <Button
              title={showCreateSession ? 'Cancel' : 'Schedule Session'}
              onPress={() => setShowCreateSession((prev) => !prev)}
            />
          </View>
        )}

        {showCreateSession && isDm && (
          <View style={styles.formContainer}>
            <Text style={styles.formLabel}>Title</Text>
            <TextInput
              style={styles.input}
              value={sessionTitle}
              onChangeText={setSessionTitle}
              placeholder="Session Title"
            />

            <Text style={styles.formLabel}>Date & Time</Text>
            <TextInput
              style={styles.input}
              value={sessionDateTime}
              onChangeText={setSessionDateTime}
              placeholder="2025-11-26 20:28"
            />

            <Text style={styles.formLabel}>Location / Link</Text>
            <TextInput
              style={styles.input}
              value={sessionLocation}
              onChangeText={setSessionLocation}
              placeholder="Foundry / Discord"
            />

            <Button
              title={sessionActionLoading ? 'Creating...' : 'Create Session'}
              onPress={handleCreateSession}
              disabled={sessionActionLoading}
            />
          </View>
        )}

        {sessionsLoading ? (
          <View style={styles.loaderRow}>
            <ActivityIndicator />
          </View>
        ) : sessions.length === 0 ? (
          <Text style={styles.sectionBody}>
            No sessions scheduled yet. {isDm ? 'Schedule one to get started.' : ''}
          </Text>
        ) : (
          <View style={styles.sessionList}>
            {sessions.map((s) => (
              <TouchableOpacity
                key={s.id}
                onPress={() =>
                  navigation.navigate('SessionDetail', {
                    sessionId: s.id,
                    campaignId,
                    title: s.title,
                    scheduledStart: s.scheduled_start,
                    location: s.location,
                    memberRole,
                  })
                }
                activeOpacity={0.7}
              >
                <View style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                    <Text style={styles.sessionTitle}>{s.title}</Text>
                    <Text style={styles.sessionStatus}>{s.status}</Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                    <Feather
                    name="calendar"
                    size={12}
                    color={colors.textMuted}
                    style={{ marginRight: 4 }}
                    />
                    <Text style={styles.sessionMeta}>
                    {formatDateTime(s.scheduled_start)}
                    </Text>
                </View>

                {s.location ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Feather
                        name="map-pin"
                        size={12}
                        color={colors.textMuted}
                        style={{ marginRight: 4 }}
                    />
                    <Text style={styles.sessionMeta}>{s.location}</Text>
                    </View>
                ) : null}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const RecapsTab: React.FC = () => {
  return (
    <ScrollView style={styles.tabContainer}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recaps</Text>
        <Text style={styles.sectionBody}>
          Session recaps written by the DM will live here so players can catch up between Long Rests.
        </Text>
      </View>
    </ScrollView>
  );
};

interface DmToolsTabProps {
  campaignId: string;
  isDm: boolean;
  editingName: string;
  setEditingName: (v: string) => void;
  editingDescription: string;
  setEditingDescription: (v: string) => void;
  settingsLoading: boolean;
  handleSaveSettings: () => void;
  deleteLoading: boolean;
  handleDeleteCampaign: () => void;
  invitesLoading: boolean;
  invites: CampaignInvite[];
  inviteActionLoading: boolean;
  handleCreateInvite: () => void;
  renderInviteStatus: (invite: CampaignInvite) => string;
}

const DmToolsTab: React.FC<DmToolsTabProps> = ({
  campaignId,
  isDm,
  editingName,
  setEditingName,
  editingDescription,
  setEditingDescription,
  settingsLoading,
  handleSaveSettings,
  deleteLoading,
  handleDeleteCampaign,
  invitesLoading,
  invites,
  inviteActionLoading,
  handleCreateInvite,
  renderInviteStatus,
}) => {
  return (
    <ScrollView style={styles.tabContainer}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Feather
            name="tool"
            size={16}
            color={colors.text}
            style={{ marginRight: 6 }}
        />
        <Text style={styles.settingsTitle}>DM Tools</Text>

        {isDm ? (
          <>
            {/* Send Packet */}
            <View style={styles.sendPacketSection}>
              <Text style={styles.settingsTitle}>Send Packet to Players</Text>
              <DmSendPacketForm campaignId={campaignId} />
            </View>

            {/* Campaign Settings */}
            <View style={styles.settingsContainer}>
              <Text style={styles.settingsTitle}>Campaign Settings</Text>

              <Text style={styles.formLabel}>Name</Text>
              <TextInput
                style={styles.input}
                value={editingName}
                onChangeText={setEditingName}
                placeholder="Campaign Name"
              />

              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={editingDescription}
                onChangeText={setEditingDescription}
                placeholder="Short description of this campaign."
                multiline
              />

              <Button
                title={settingsLoading ? 'Saving...' : 'Save Changes'}
                onPress={handleSaveSettings}
                disabled={settingsLoading}
              />

              <View style={styles.dangerZone}>
                <Text style={styles.dangerTitle}>Danger zone</Text>
                <Button
                  title={deleteLoading ? 'Deleting...' : 'Delete Campaign'}
                  onPress={handleDeleteCampaign}
                  color="#b00020"
                  disabled={deleteLoading}
                />
              </View>
            </View>

            {/* Invite Codes */}
            <View style={styles.inviteSection}>
              <Text style={styles.settingsTitle}>Invite Codes</Text>
              <Text style={styles.sectionBody}>
                Generate invite codes and share them with your players so they
                can join this campaign.
              </Text>

              <View style={{ marginVertical: 8 }}>
                <Button
                  title={inviteActionLoading ? 'Creating code...' : 'Generate Invite Code'}
                  onPress={handleCreateInvite}
                  disabled={inviteActionLoading}
                />
              </View>

              {invitesLoading ? (
                <View style={styles.loaderRow}>
                  <ActivityIndicator />
                </View>
              ) : invites.length === 0 ? (
                <Text style={styles.sectionBody}>
                  No invite codes yet. Generate one above.
                </Text>
              ) : (
                <View style={styles.inviteList}>
                  {invites.map((inv) => (
                    <View key={inv.id} style={styles.inviteCard}>
                      <Text style={styles.inviteCode}>{inv.code}</Text>
                      <Text style={styles.inviteMeta}>
                        Created: {formatDateTime(inv.created_at)}
                      </Text>
                      {inv.expires_at && (
                        <Text style={styles.inviteMeta}>
                          Expires: {formatDateTime(inv.expires_at)}
                        </Text>
                      )}
                      <Text style={styles.inviteStatus}>
                        Status: {renderInviteStatus(inv)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        ) : (
          <Text style={styles.sectionBody}>
            DM-only tools will appear here. Ask your DM for an invite code to
            join campaigns.
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
    headerContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.bgElevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabContainer: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.bg,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 8,
    color: colors.textMuted,
  },
  section: {
  marginBottom: spacing.lg,
  padding: spacing.md,
  borderRadius: radii.md,
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: colors.card,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    color: colors.text,
  },
  sectionBody: {
    color: colors.textMuted,
  },
  debugText: {
    marginTop: 4,
    fontSize: 10,
    color: colors.textMuted,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  formContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.cardSoft,
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
    backgroundColor: colors.cardSoft,
  },
  multilineInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  sessionCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.card,
  },
  sessionTitle: {
    fontWeight: '600',
    flex: 1,
    paddingRight: 8,
    color: colors.text,
  },
  sessionStatus: {
    fontSize: 12,
    color: colors.textMuted,
  },
  sessionMeta: {
    fontSize: 13,
    color: colors.textMuted,
  },
  settingsContainer: {
    marginBottom: spacing.lg,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: colors.text,
  },
  dangerZone: {
    marginTop: 12,
  },
  dangerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.danger,
    marginBottom: 4,
  },
  inviteCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: 6,
    backgroundColor: colors.cardSoft,
  },
  inviteCode: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: colors.text,
  },
  inviteMeta: {
    fontSize: 12,
    color: colors.textMuted,
  },
  inviteStatus: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  sendPacketSection: {
    marginBottom: spacing.lg,
  },

});

export default CampaignDetailScreen;
