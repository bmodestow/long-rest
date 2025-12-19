import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';
import { motion } from '../../theme';

type Props = {
    children: React.ReactNode;
    style?: ViewStyle | ViewStyle[];
    distance?: number; // default motion.distance.lg
};

export const EnterFadeSlide: React.FC<Props> = ({
    children,
    style,
    distance = motion.distance.lg,
}) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(distance)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: motion.duration.normal,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: motion.duration.normal,
                useNativeDriver: true,
            }),
        ]).start();
    }, [opacity, translateY]);

    return (
        <Animated.View
            style={[
                style as any,
                {
                    opacity,
                    transform: [{ translateY }],
                },
            ]}
        >
            {children}
        </Animated.View>
    );
};