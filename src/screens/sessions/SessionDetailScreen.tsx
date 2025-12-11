// src/screens/campaigns/SessionDetailScreen.tsx
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Button,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import {
    fetchRecapForSession,
    saveRecapForSession,
    SessionRecap,
} from '../../api/recaps';
import { ScreenContainer } from '../../components/ScreenContainer';
import type { AppStackParamList } from '../../navigation/AppNavigator';
import { colors, radii, spacing } from '../../theme';
import { formatDateTime } from '../../utils/formatDate';

type Props = NativeStackScreenProps<AppStackParamList, 'SessionDetail'>;

const SessionDetailScreen: React.FC<Props> = ({ route }) => {
  const { sessionId, title, scheduledStart, location, memberRole } = route.params;

  const [loading, setLoading] = useState(true);
  const [recap, setRecap] = useState<SessionRecap | null>(null);
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    loadRecap();
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

  const togglePublish = () => {
    setIsPublished((prev) => !prev);
  };

  const canViewRecap = !!recap && (recap.is_published || isDm);

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
                title={
                  isPublished ? 'Unpublish (make draft)' : 'Publish recap'
                }
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
