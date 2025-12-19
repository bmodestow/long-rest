import React, { useMemo, useRef } from 'react';
import { Animated, Pressable, PressableProps, ViewStyle } from 'react-native';
import { motion } from '../../theme';

type Props = PressableProps & {
  children: React.ReactNode;
  scaleTo?: number;      // default 0.97
  pressedOpacity?: number; // default 0.85
  style?: ViewStyle | ViewStyle[];
};

export const PressableScale: React.FC<Props> = ({
  children,
  scaleTo = 0.97,
  pressedOpacity = 0.85,
  style,
  ...props
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const animatedStyle = useMemo(
    () => ({
      transform: [{ scale }],
      opacity,
    }),
    [scale, opacity]
  );

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: scaleTo,
        duration: motion.duration.fast,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: pressedOpacity,
        duration: motion.duration.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateOut = () => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: motion.duration.fast,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: motion.duration.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Pressable
      {...props}
      onPressIn={(e) => {
        animateIn();
        props.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        animateOut();
        props.onPressOut?.(e);
      }}
    >
      <Animated.View style={[style as any, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
};
