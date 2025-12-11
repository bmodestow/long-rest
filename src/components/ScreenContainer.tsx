// src/components/ScreenContainer.tsx
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    ScrollView,
    StyleProp,
    StyleSheet,
    ViewStyle
} from 'react-native';
import { colors, spacing } from '../theme';

type ScreenContainerProps = {
  children: React.ReactNode;
  scroll?: boolean;
  center?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scroll,
  center,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  if (scroll) {
    return (
      <Animated.View style={[styles.root, { opacity }]}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            center && styles.center,
            style,
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.root,
        center && styles.center,
        style,
        { opacity },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  content: {
    flexGrow: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
