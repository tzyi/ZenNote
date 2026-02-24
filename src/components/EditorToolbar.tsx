import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { useColors } from '../theme';

interface ToolbarAction {
  icon: string;
  label: string;
  onPress: () => void;
  active?: boolean;
}

interface EditorToolbarProps {
  onTagPress: () => void;
  onImagePress: () => void;
  onBoldPress?: () => void;
  onMorePress?: () => void;
}

export function EditorToolbar({
  onTagPress,
  onImagePress,
  onBoldPress,
  onMorePress,
}: EditorToolbarProps) {
  const colors = useColors();

  const actions: ToolbarAction[] = [
    { icon: '#', label: '標籤', onPress: onTagPress },
    { icon: '🖼', label: '圖片', onPress: onImagePress },
    { icon: 'B', label: '粗體', onPress: onBoldPress ?? (() => undefined) },
    { icon: '⋯', label: '更多', onPress: onMorePress ?? (() => undefined) },
  ];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderTopColor: colors.border },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {actions.map((action) => (
          <TouchableOpacity
            key={action.label}
            onPress={action.onPress}
            style={[
              styles.button,
              action.active && { backgroundColor: colors.accentGreen },
            ]}
          >
            <Text
              style={[
                styles.buttonIcon,
                {
                  color: action.active ? colors.textInverse : colors.icon,
                  fontWeight: action.label === '粗體' ? '700' : '400',
                },
              ]}
            >
              {action.icon}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingVertical: 4,
  },
  scrollContent: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  button: {
    width: 40,
    height: 36,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  buttonIcon: {
    fontSize: 16,
  },
});
