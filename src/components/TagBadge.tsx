import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { useColors } from '../theme';

interface TagBadgeProps {
  label: string;
  onPress?: () => void;
  variant?: 'default' | 'active' | 'muted';
  maxWidth?: number;
}

export function TagBadge({ label, onPress, variant = 'default', maxWidth = 120 }: TagBadgeProps) {
  const colors = useColors();

  const bgColor =
    variant === 'active' ? colors.accentGreen : variant === 'muted' ? colors.surface : colors.tag;
  const textColor =
    variant === 'active'
      ? colors.textInverse
      : variant === 'muted'
        ? colors.textMuted
        : colors.accentGreen;

  const content = (
    <View style={[styles.badge, { backgroundColor: bgColor, maxWidth }]}>
      <Text style={[styles.label, { color: textColor }]} numberOfLines={1}>
        #{label}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
});
