import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { useColors } from '../theme';

interface FABProps {
  onPress: () => void;
  onLongPress?: () => void;
  icon?: string;
  style?: ViewStyle;
  size?: 'sm' | 'md' | 'lg';
}

export function FAB({ onPress, onLongPress, icon = '+', style, size = 'md' }: FABProps) {
  const colors = useColors();

  const dimensions = { sm: 44, md: 56, lg: 64 }[size];
  const fontSize = { sm: 20, md: 28, lg: 32 }[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.85}
      style={[
        styles.fab,
        {
          backgroundColor: colors.fab,
          width: dimensions,
          height: dimensions,
          borderRadius: dimensions / 2,
          shadowColor: colors.accentGreen,
        },
        style,
      ]}
    >
      <Text style={[styles.icon, { fontSize, color: colors.fabIcon }]}>{icon}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  icon: {
    fontWeight: '300',
    lineHeight: undefined,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
