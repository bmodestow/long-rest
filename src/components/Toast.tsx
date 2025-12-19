import React, { useEffect, useRef } from 'react';
import { Animated, Text, ViewStyle } from 'react-native';
import { colors, radii, spacing } from '../theme';

type Props = {
    message: string | null;
    visible: boolean;
    durationMs?: number; // default 1600
    style?: ViewStyle | ViewStyle[];
    onHide?: () => void;
};

export const Toast: React.FC<Props> = ({
    message,
    visible,
    durationMs = 1600,
    style,
    onHide,
}) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(10)).current;

    useEffect(() => {
        if (!visible || !message) return;

        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 140,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 140,
                useNativeDriver: true,
            }),
        ]).start();

        const t = setTimeout(() => {
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 140,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 10,
                    duration: 140,
                    useNativeDriver: true,
                }),
            ]).start(({ finished }) => {
                if (finished) onHide?.();
            });
        }, durationMs);

        return () => clearTimeout(t);
    }, [visible, message, durationMs, onHide, opacity, translateY]);

    if (!message) return null;

    return (
        <Animated.View
            pointerEvents="none"
            style={[
                {
                    position: 'absolute',
                    left: spacing.xl,
                    right: spacing.xl,
                    bottom: spacing.xl,
                    backgroundColor: colors.card,
                    borderRadius: radii.lg,
                    paddingVertical: spacing.md,
                    paddingHorizontal: spacing.lg,
                    borderWidth: 1,
                    borderColor: colors.border,
                    shadowOpacity: 0.25,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 6 },
                    elevation: 6,
                    opacity,
                    transform: [{ translateY }],
                },
                style as any,
            ]}
        >
            <Text style={{ color: colors.text, textAlign: 'center' }}>{message}</Text>
        </Animated.View>
    );
};