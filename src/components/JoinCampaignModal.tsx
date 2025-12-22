import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { joinCampaignWithInviteCode } from '../api/invites';
import { colors, radii, spacing } from '../theme';

type Props = {
    visible: boolean;
    onClose: () => void;
    onJoined: () => Promise<void> | void;
};

function normalizeInviteCode(raw: string) {
    return raw.replace(/\s+/g, '').toUpperCase;
}

export const JoinCampaignModal: React.FC<Props> = ({ visible, onClose, onJoined }) => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    const normalized = useMemo(() => normalizeInviteCode(code), [code]);
    const canSubmit = normalized.length >= 4 && !loading;

    const handleJoin = async () => {
        if (!canSubmit) return;

        try {
            setLoading(true);
            const res = await joinCampaignWithInviteCode(code);

            if (!res.ok) {
                Alert.alert('Could not join', res.message ?? 'Something went wrong.');
            }

            await onJoined();
            setCode('');
            onClose();
        } catch (e: any) {
            Alert.alert('Could not join', e?.message ?? 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
         <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.backdrop} onPress={onClose}/>

            <View style={styles.sheetWrap} pointerEvents="box-none">
                <View style={styles.sheet}>
                    <Text style={styles.title}>Join a Campaign</Text>
                    <Text style={styles.subtitle}>Enter an invite code to join.</Text>

                    <TextInput
                        value={code}
                        onChangeText={setCode}
                        placeholder="INVITE CODE"
                        placeholderTextColor={colors.textMuted}
                        autoCapitalize="characters"
                        autoCorrect={false}
                        keyboardType="default"
                        style={styles.input}
                        editable={!loading}
                        returnKeyType="join"
                        onSubmitEditing={handleJoin}
                    />

                    <View style={styles.row}>
                        <Pressable style={[styles.btn, styles.btnGhost]} onPress={onClose} disabled={loading}>
                            <Text style={styles.btnText}>Cancel</Text>
                        </Pressable>

                        <Pressable 
                            style={[styles.btn, styles.btnPrimary, !canSubmit && styles.btnDisabled]}
                            onPress={handleJoin}
                            disabled={!canSubmit}
                        >
                            {loading ? (
                                <ActivityIndicator />
                            ) : (
                                <Text style={[styles.btnText, styles.btnTextPrimary]}>Join</Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </View>
         </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0,.55)',
    },
    sheetWrap: {
        flex: 1,
        justifyContent: 'center',
        padding: spacing.xl,
    },
    sheet: {
        backgroundColor: colors.card,
        borderRadius: radii.xl,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.xl,
    },
    title: {
        color: colors.text,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: spacing.sm,
    },
    subtitle: {
        color: colors.textMuted,
        marginBottom: spacing.lg,
    },
    input: {
        backgroundColor: colors.cardSoft,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: radii.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        color: colors.text,
        letterSpacing: 1,
        marginBottom: spacing.lg,
    },
    row: {
        flexDirection: 'row',
        gap: spacing.md,
        justifyContent: 'flex-end',
    },
    btn: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.border,
        minWidth: 110,
        alignItems: 'center',
    },
    btnGhost: {
        backgroundColor: 'transparent',
    },
    btnPrimary: {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
    },
    btnDisabled: {
        opacity: 0.5,
    },
    btnText: {
        color: colors.text,
        fontWeight: '700',
    },
    btnTextPrimary: {
        color: '#111',
    },
});