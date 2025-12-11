import React, { useRef } from 'react';
import {
    Animated,
    Pressable,
    PressableProps,
    StyleProp,
    ViewStyle,
} from 'react-native';

interface PressableScaleProps extends PressableProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

const PressableScale: React.FC<PressableScaleProps> = ({
    children,
    style,
    onPressIn,
    onPressOut,
    ...rest
}) => {
    const scale = useRef(new Animated.Value(1)).current;

    const animateTo = (toValue: number) => {
        Animated.spring(scale, {
            toValue,
            useNativeDriver: true,
            speed: 40,
            bounciness: 4,
        }).start();
    };

    return (
        <Animated.View style={[{ transform: [{ scale }] }, style]}>
            <Pressable
                {...rest}
                onPressIn={(e) => {
                    animateTo(0.96);
                    onPressIn?.(e);
                }}
                onPressOut={(e) => {
                    animateTo(1);
                    onPressOut?.(e);
                }}
                style={({ pressed }) => [
                    pressed && { opacity: 0.9 },
                ]}
            >
                {children}
            </Pressable>
        </Animated.View>
    );
};

export default PressableScale;