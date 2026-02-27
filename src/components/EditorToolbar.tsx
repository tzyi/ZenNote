import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { useColors } from '../theme';

interface ToolbarAction {
  icon: string;
  label: string;
  onPress: () => void;
  active?: boolean;
  fontWeight?: '400' | '700';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'line-through';
}

interface EditorToolbarProps {
  onTagPress: () => void;
  onImagePress: () => void;
  onBoldPress?: () => void;
  onItalicPress?: () => void;
  onHeadingPress?: () => void;
  onListPress?: () => void;
  onDividerPress?: () => void;
  onCodePress?: () => void;
  onQuotePress?: () => void;
  onLinkPress?: () => void;
  onStrikethroughPress?: () => void;
  onPreviewToggle?: () => void;
  isPreviewMode?: boolean;
  onMorePress?: () => void;
}

export function EditorToolbar({
  onTagPress,
  onImagePress,
  onBoldPress,
  onItalicPress,
  onHeadingPress,
  onListPress,
  onDividerPress,
  onCodePress,
  onQuotePress,
  onLinkPress,
  onStrikethroughPress,
  onPreviewToggle,
  isPreviewMode,
  onMorePress,
}: EditorToolbarProps) {
  const colors = useColors();
  const [showMore, setShowMore] = useState(false);

  const mainActions: ToolbarAction[] = [
    { icon: '#', label: '標籤', onPress: onTagPress },
    { icon: '🖼', label: '圖片', onPress: onImagePress },
    { icon: 'B', label: '粗體', onPress: onBoldPress ?? (() => undefined), fontWeight: '700' },
    { icon: 'I', label: '斜體', onPress: onItalicPress ?? (() => undefined), fontStyle: 'italic' },
    { icon: 'H', label: '標題', onPress: onHeadingPress ?? (() => undefined) },
    { icon: '⋯', label: '更多', onPress: () => setShowMore((p) => !p) },
  ];

  const moreActions: ToolbarAction[] = [
    { icon: '•', label: '列表', onPress: onListPress ?? (() => undefined) },
    { icon: '—', label: '分隔線', onPress: onDividerPress ?? (() => undefined) },
    { icon: 'S', label: '刪除線', onPress: onStrikethroughPress ?? (() => undefined), textDecoration: 'line-through' },
    { icon: '❝', label: '引用', onPress: onQuotePress ?? (() => undefined) },
    { icon: '</>', label: '程式碼', onPress: onCodePress ?? (() => undefined) },
    { icon: '🔗', label: '連結', onPress: onLinkPress ?? (() => undefined) },
  ];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderTopColor: colors.border },
      ]}
    >
      {showMore && (
        <View style={[styles.moreRow, { borderBottomColor: colors.border }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {moreActions.map((action) => (
              <TouchableOpacity
                key={action.label}
                onPress={() => {
                  action.onPress();
                  setShowMore(false);
                }}
                style={styles.button}
              >
                <Text
                  style={[
                    styles.buttonIcon,
                    {
                      color: colors.icon,
                      fontWeight: action.fontWeight ?? '400',
                      fontStyle: action.fontStyle ?? 'normal',
                      textDecorationLine: action.textDecoration ?? 'none',
                    },
                  ]}
                >
                  {action.icon}
                </Text>
                <Text style={[styles.buttonLabel, { color: colors.textMuted }]}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {mainActions.map((action) => (
          <TouchableOpacity
            key={action.label}
            onPress={action.onPress}
            style={[
              styles.button,
              action.active && { backgroundColor: colors.accentGreen },
              action.label === '更多' && showMore && { backgroundColor: colors.surfaceVariant },
            ]}
          >
            <Text
              style={[
                styles.buttonIcon,
                {
                  color: action.active ? colors.textInverse : colors.icon,
                  fontWeight: action.fontWeight ?? '400',
                  fontStyle: action.fontStyle ?? 'normal',
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
  moreRow: {
    borderBottomWidth: 1,
    paddingVertical: 4,
  },
  scrollContent: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  button: {
    minWidth: 40,
    height: 36,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    paddingHorizontal: 8,
    flexDirection: 'row',
    gap: 4,
  },
  buttonIcon: {
    fontSize: 16,
  },
  buttonLabel: {
    fontSize: 11,
  },
});
