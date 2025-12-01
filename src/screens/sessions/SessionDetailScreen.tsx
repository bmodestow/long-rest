import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TextInput,
    Button,
    Alert,
    ScrollView,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../navigation/AppNavigator';
import { formatDateTime } from '../../utils/formatDate';
import {
    fetchRecapForSession,
    saveRecapForSession,
    SessionRecap,
} from '../../api/recaps';

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
            Alert.alert(
                'Error',
                err?.message ?? 'Failed to load session recap.'
            );
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
            Alert.alert('Saved', isPublished ? 'Recap published.' : 'Recap saved as draft.');
        } catch (err: any) {
            Alert.alert(
                'Error',
                err?.message ?? 'Failed to save recap.'
            );
        } finally {
            setSaving(false);
        }
    };

    const togglePublish = () => {
        setIsPublished((prev) => !prev);
    };

    const canViewRecap = 
        !!recap && (recap.is_published || isDm);

    return (
        <ScrollView style={styles.container}>
            {/* Session Info */}
            <View style={styles.section}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.meta}>{formatDateTime(scheduledStart)}</Text>
                {location ? <Text style={styles.meta}>{location}</Text>: null}
                <Text style={styles.roleBadge}>
                    {isDm ? 'You are a DM for this session.' : 'You are a player in this session.'}
                </Text>
            </View>

            {/* Recap display / editor */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Session Recap</Text>

                {loading ? (
                    <View style={styles.loaderRow}>
                        <ActivityIndicator />
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
                        />

                        <View style={styles.toggleRow}>
                            <Button
                                title={isPublished ? 'Unpublish (make draft)' : 'Publish recap'}
                                onPress={togglePublish}
                            />
                            <Text style={styles.publishStatus}>
                                {isPublished ? 'Published (players can see it)' : 'Draft (only you can see it)'}
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
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 16,
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 4,
    },
    meta: {
        color: '#555',
    },
    roleBadge: {
        marginTop: 8,
        fontSize: 13,
        color: '#666',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 6,
    },
    loaderRow: {
        marginTop: 8,
    },
    helperText: {
        color: '#555',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginBottom: 8,
    },
    multilineInput: {
        minHeight: 120,
        textAlignVeritcal: 'top',
    },
    toggleRow: {
        marginBottom: 8,
    },
    publishStatus: {
        marginTop: 4,
        fontSize: 13,
        color: '#444',
    },
    recapText: {
        color: '#333',
    },
});

export default SessionDetailScreen;