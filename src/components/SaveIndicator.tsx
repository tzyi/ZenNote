import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { useColors } from '../theme';

interface SaveIndicatorProps {
  visible: boolean;
  message?: string;
}

export function SaveIndicator({ visible, message = '已儲存' }: SaveIndicatorProps) {
  const colors = useColors();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(1500),
        Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, opacity]);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Text style={[styles.text, { color: colors.accentGreen }]}>✓ {message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
});
