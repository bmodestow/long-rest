// src/screens/campaigns/SessionDetailScreen.tsx
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { fetchCampaignMembers } from '../../api/campaignMembers'; // adjust import path if yours differs
import {
  fetchRecapForSession,
  saveRecapForSession,
  SessionRecap,
} from '../../api/recaps';
import {
  fetchSessionResponses,
  upsertSessionResponse,
  type SessionResponse,
  type SessionResponseValue,
} from '../../api/sessionResponses';
import { supabase } from '../../api/supabaseClient';

import { PressableScale } from '../../components/motion/PressableScale';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Toast } from '../../components/Toast';
import type { AppStackParamList } from '../../navigation/AppNavigator';
import { colors, radii, spacing } from '../../theme';
import { formatDateTime } from '../../utils/formatDate';

type Props = NativeStackScreenProps<AppStackParamList, 'SessionDetail'>;

type NameMap = Record<string, string>;

const shortId = (id: string) => `${id.slice(0, 6)}…${id.slice(-4)}`;

const SessionDetailScreen: React.FC<Props> = ({ route }) => {
  const {
    sessionId,
    campaignId, // make sure this is passed in navigation (you already do)
    title,
    scheduledStart,
    location,
    memberRole,
  } = route.params;

  // Recap state
  const [loading, setLoading] = useState(true);
  const [recap, setRecap] = useState<SessionRecap | null>(null);
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [saving, setSaving] = useState(false);

  // Responses state
  const [responsesLoading, setResponsesLoading] = useState(true);
  const [responses, setResponses] = useState<SessionResponse[]>([]);
  const [responding, setResponding] = useState(false);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [nameMap, setNameMap] = useState<NameMap>({});

  // Toast state
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  const yesPulse = useState(new Animated.Value(1))[0];
  const noPulse = useState(new Animated.Value(1))[0];

  const isDm = memberRole === 'dm' || memberRole === 'co_dm';

  const loadRecap = async () => {
    try {
      setLoading(true);
      const data = await fetchRecapForSession(sessionId);
      setRecap(data);
      if (data) {
        setContent(data.content);
        setIsPublished(data.is_published);
      } else {
        setContent('');
        setIsPublished(false);
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to load session recap.');
    } finally {
      setLoading(false);
    }
  };

  const tryLoadDisplayNames = async (userIds: string[]) => {
    // Optional enhancement: if you have a profiles table with display_name.
    // If not, this simply fails silently and we fallback to short ids.
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', userIds);

      if (error) return;

      const map: NameMap = {};
      (data ?? []).forEach((row: any) => {
        if (row?.id) map[row.id] = row.display_name || shortId(row.id);
      });
      setNameMap(map);
    } catch {
      // ignore
    }
  };

  const loadResponses = async () => {
    try {
      setResponsesLoading(true);

      // who am I?
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id ?? null;
      setMyUserId(uid);

      // fetch members so we can show "no response yet"
      const members = await fetchCampaignMembers(campaignId);
      const memberIds = members.map((m) => m.user_id);

      // try to get display names (optional)
      await tryLoadDisplayNames(memberIds);

      // fetch responses
      const data = await fetchSessionResponses(sessionId);
      setResponses(data);
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to load session responses.');
    } finally {
      setResponsesLoading(false);
    }
  };

  useEffect(() => {
    loadRecap();
    loadResponses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('Missing content', 'Please write something for the recap.');
      return;
    }

    setSaving(true);
    try {
      const saved = await saveRecapForSession(
        sessionId,
        content.trim(),
        isPublished
      );
      setRecap(saved);
      Alert.alert(
        'Saved',
        isPublished ? 'Recap published.' : 'Recap saved as draft.'
      );
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to save recap.');
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = () => setIsPublished((prev) => !prev);

  const canViewRecap = !!recap && (recap.is_published || isDm);

  const myResponse = useMemo(() => {
    if (!myUserId) return null;
    return responses.find((r) => r.user_id === myUserId)?.response ?? null;
  }, [responses, myUserId]);

  const yesCount = useMemo(
    () => responses.filter((r) => r.response === 'yes').length,
    [responses]
  );
  const noCount = useMemo(
    () => responses.filter((r) => r.response === 'no').length,
    [responses]
  );

  const handleRespond = async (value: SessionResponseValue) => {
    if (responding) return;

    setResponding(true);
    try {
      await upsertSessionResponse(sessionId, value);
      showToast('Response saved');
      await loadResponses(); // simple refresh; realtime later if you want
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to submit response.');
    } finally {
      setResponding(false);
    }
  };

  const displayNameFor = (userId: string) =>
    nameMap[userId] ?? shortId(userId);

  // Sort: yes first, then no
  const sortedResponses = useMemo(() => {
    const copy = [...responses];
    copy.sort((a, b) => {
      if (a.response === b.response) return a.created_at < b.created_at ? 1 : -1;
      return a.response === 'yes' ? -1 : 1;
    });
    return copy;
  }, [responses]);

  // For getting toasty
  const pulse = (val: Animated.Value) => {
    val.setValue(1);
    Animated.sequence([
      Animated.timing(val, { toValue: 1.04, duration: 120, useNativeDriver: true }),
      Animated.timing(val, { toValue: 1, duration: 140, useNativeDriver: true }),
    ]).start();
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
  };

  useEffect(() => {
    if (myResponse === 'yes') pulse(yesPulse);
    if (myResponse === 'no') pulse(noPulse);
  }, [myResponse, yesPulse, noPulse]);

  return (
    <ScreenContainer scroll>
      {/* Session Info */}
      <View style={styles.section}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.meta}>{formatDateTime(scheduledStart)}</Text>
        {location ? <Text style={styles.meta}>{location}</Text> : null}
        <Text style={styles.roleBadge}>
          {isDm
            ? 'You are a DM for this session.'
            : 'You are a player in this session.'}
        </Text>
      </View>

      {/* Attendance / Responses */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session Responses</Text>

        {responsesLoading ? (
          <View style={styles.loaderRow}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : (
          <>
            <View style={styles.responseRow}>
              <Animated.View style={{ flex: 1, transform: [{ scale: yesPulse }] }}>
                <PressableScale
                  onPress={() => handleRespond('yes')}
                  disabled={responding}
                  style={[
                    styles.responseButton,
                    myResponse === 'yes' && styles.responseButtonActiveYes,
                  ]}
                >
                  <View style={styles.responseButtonInner}>
                    <Feather
                      name="check"
                      size={16}
                      color={myResponse === 'yes' ? colors.bg : colors.text}
                    />
                    <Text
                      style={[
                        styles.responseButtonText,
                        myResponse === 'yes' && styles.responseButtonTextActive,
                      ]}
                    >
                      Yes
                    </Text>
                  </View>
                </PressableScale>
              </Animated.View>

              <Animated.View style={{ flex: 1, transform: [{ scale: noPulse }] }}>
                <PressableScale
                  onPress={() => handleRespond('no')}
                  disabled={responding}
                  style={[
                    styles.responseButton,
                    myResponse === 'no' && styles.responseButtonActiveNo,
                  ]}
                >
                  <View style={styles.responseButtonInner}>
                    <Feather
                      name="x"
                      size={16}
                      color={myResponse === 'no' ? colors.bg : colors.text}
                    />
                    <Text
                      style={[
                        styles.responseButtonText,
                        myResponse === 'no' && styles.responseButtonTextActive,
                      ]}
                    >
                      No
                    </Text>
                  </View>
                </PressableScale>
              </Animated.View>
            </View>

            <View style={styles.countRow}>
              <Text style={styles.countPill}>Yes: {yesCount}</Text>
              <Text style={styles.countPill}>No: {noCount}</Text>
              <Text style={styles.countPill}>
                Total: {responses.length}
              </Text>
            </View>

            {sortedResponses.length === 0 ? (
              <Text style={styles.helperText}>
                No one has responded yet. Tap Yes or No to kick it off.
              </Text>
            ) : (
              <View style={{ marginTop: spacing.sm }}>
                {sortedResponses.map((r) => {
                  const isYes = r.response === 'yes';

                  return (
                    <View 
                      key={r.id ?? `${r.session_id}:${r.user_id}`} 
                      style={styles.responseItem}
                    >
                      <Text style={styles.responseName}>
                        {displayNameFor(r.user_id)}
                        {myUserId && r.user_id === myUserId ? ' (you)' : ''}
                      </Text>

                      <View
                        style={[
                          styles.responseBadge,
                          isYes ? styles.badgeYes : styles.badgeNo,
                        ]}
                      >
                        <Text style={styles.responseBadgeText}>
                          {isYes ? 'YES' : 'NO'}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}
      </View>

      {/* Recap display / editor */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session Recap</Text>

        {loading ? (
          <View style={styles.loaderRow}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : isDm ? (
          <>
            <Text style={styles.helperText}>
              Write or edit the recap below. Toggle publish to control whether
              players can see it.
            </Text>

            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={content}
              onChangeText={setContent}
              multiline
              placeholder="What happened this session? Major events, NPCs, loot, consequences..."
              placeholderTextColor={colors.textMuted}
            />

            <View style={styles.toggleRow}>
              <Button
                title={isPublished ? 'Unpublish (make draft)' : 'Publish recap'}
                onPress={togglePublish}
              />
              <Text style={styles.publishStatus}>
                {isPublished
                  ? 'Published (players can see it)'
                  : 'Draft (only you can see it)'}
              </Text>
            </View>

            <Button
              title={saving ? 'Saving...' : 'Save recap'}
              onPress={handleSave}
              disabled={saving}
            />
          </>
        ) : canViewRecap ? (
          <Text style={styles.recapText}>{recap?.content}</Text>
        ) : (
          <Text style={styles.helperText}>
            The DM hasn&apos;t published a recap for this session yet.
          </Text>
        )}
      </View>

      <Toast
        message={toastMsg}
        visible={toastVisible}
        onHide={() => {
          setToastVisible(false);
          setToastMsg(null);
        }}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
    color: colors.text,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13,
  },
  roleBadge: {
    marginTop: 8,
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    color: colors.text,
  },
  loaderRow: {
    marginTop: spacing.sm,
  },
  helperText: {
    color: colors.textMuted,
    marginBottom: spacing.sm,
    fontSize: 13,
  },

  // Responses UI
  responseRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  responseButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardSoft,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  responseButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  responseButtonText: {
    marginLeft: 8,
    color: colors.text,
    fontWeight: '600',
  },
  responseButtonTextActive: {
    color: colors.bg,
  },
  responseButtonActiveYes: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  responseButtonActiveNo: {
    backgroundColor: colors.danger,
    borderColor: colors.dangerBorder,
  },
  countRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  countPill: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    color: colors.textMuted,
    fontSize: 12,
  },
  responseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  responseName: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
  },
  responseBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  badgeYes: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  badgeNo: {
    backgroundColor: colors.dangerBorder,
    borderColor: colors.danger,
  },
  responseBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.bg,
    letterSpacing: 0.5,
  },

  // Recap styles (existing)
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: spacing.sm,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.cardSoft,
  },
  multilineInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  toggleRow: {
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  publishStatus: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textMuted,
  },
  recapText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default SessionDetailScreen;
