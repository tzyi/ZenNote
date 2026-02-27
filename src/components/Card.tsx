import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  LayoutChangeEvent,
  Platform,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Markdown from 'react-native-markdown-display';
import { Note } from '../models';
import { TagBadge } from './TagBadge';
import { useColors } from '../theme';
import type { ColorScheme } from '../theme';

const COLLAPSED_MAX_HEIGHT = 120; // ~5 lines
const MAX_VISIBLE_TAGS = 5;

function buildCardMarkdownStyles(colors: ColorScheme) {
  return StyleSheet.create({
    body: { color: colors.textPrimary, fontSize: 15, lineHeight: 22 },
    heading1: { color: colors.textPrimary, fontSize: 18, fontWeight: '700' as const, marginTop: 4, marginBottom: 2 },
    heading2: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' as const, marginTop: 4, marginBottom: 2 },
    heading3: { color: colors.textPrimary, fontSize: 15, fontWeight: '600' as const, marginTop: 2, marginBottom: 2 },
    paragraph: { marginTop: 0, marginBottom: 4 },
    strong: { fontWeight: '700' as const },
    em: { fontStyle: 'italic' as const },
    s: { textDecorationLine: 'line-through' as const },
    link: { color: colors.accentBlue },
    code_inline: {
      backgroundColor: colors.surfaceVariant,
      color: colors.accentOrange,
      borderRadius: 3,
      paddingHorizontal: 4,
      fontSize: 13,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    fence: {
      backgroundColor: colors.surface,
      color: colors.textPrimary,
      borderRadius: 6,
      padding: 8,
      marginVertical: 4,
      fontSize: 12,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    blockquote: {
      backgroundColor: colors.surfaceVariant,
      borderLeftWidth: 3,
      borderLeftColor: colors.accentGreen,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginVertical: 4,
      borderRadius: 3,
    },
    hr: { backgroundColor: colors.divider, height: 1, marginVertical: 6 },
    bullet_list: { marginVertical: 2 },
    ordered_list: { marginVertical: 2 },
    list_item: { flexDirection: 'row' as const, marginVertical: 1 },
    bullet_list_icon: { color: colors.accentGreen, marginRight: 6, fontSize: 14 },
    ordered_list_icon: { color: colors.accentGreen, marginRight: 6, fontSize: 14 },
  });
}

interface CardProps {
  note: Note;
  onPress: () => void;
  onLongPress: () => void;
  showRecycleDays?: boolean;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  if (sameDay) {
    return d.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  return d.toLocaleDateString('zh-TW', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function Card({ note, onPress, onLongPress, showRecycleDays }: CardProps) {
  const [expanded, setExpanded] = useState(false);
  const [contentOverflows, setContentOverflows] = useState(false);
  const colors = useColors();
  const markdownStyles = useMemo(() => buildCardMarkdownStyles(colors), [colors]);

  const visibleTags = note.tags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenTagCount = note.tags.length - MAX_VISIBLE_TAGS;

  const handleContentLayout = useCallback((e: LayoutChangeEvent) => {
    if (!expanded && e.nativeEvent.layout.height >= COLLAPSED_MAX_HEIGHT - 4) {
      setContentOverflows(true);
    }
  }, [expanded]);

  return (
    <Animated.View entering={FadeIn.duration(300)}>
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.85}
        style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        {/* Timestamp */}
        <View style={styles.header}>
          <Text style={[styles.timestamp, { color: colors.textMuted }]}>
            {formatDate(note.createdAt)}
          </Text>
          {note.isPinned && (
            <Text style={[styles.pinnedIcon, { color: colors.accentGreen }]}>📌</Text>
          )}
        </View>

        {/* Markdown Content */}
        <View
          style={[
            styles.contentWrapper,
            !expanded && { maxHeight: COLLAPSED_MAX_HEIGHT, overflow: 'hidden' },
          ]}
          onLayout={handleContentLayout}
        >
          <Markdown style={markdownStyles}>{note.content}</Markdown>
        </View>

        {/* Expand / Collapse button */}
        {contentOverflows && !expanded && (
          <TouchableOpacity
            onPress={() => setExpanded(true)}
            style={styles.expandBtn}
          >
            <Text style={[styles.expandText, { color: colors.accentGreen }]}>▼ 展開</Text>
          </TouchableOpacity>
        )}
        {contentOverflows && expanded && (
          <TouchableOpacity
            onPress={() => setExpanded(false)}
            style={styles.expandBtn}
          >
            <Text style={[styles.expandText, { color: colors.accentGreen }]}>▲ 收合</Text>
          </TouchableOpacity>
        )}
        {note.images.length > 0 && (
          <View style={styles.imagesRow}>
            {note.images.slice(0, 3).map((img) => (
              <Image
                key={img.id}
                source={{ uri: img.uri }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            ))}
            {note.images.length > 3 && (
              <View style={[styles.moreImages, { backgroundColor: colors.surface }]}>
                <Text style={[styles.moreImagesText, { color: colors.textSecondary }]}>
                  +{note.images.length - 3}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Tags */}
        {visibleTags.length > 0 && (
          <View style={styles.tagsRow}>
            {visibleTags.map((tag) => (
              <TagBadge key={tag} label={tag} />
            ))}
            {hiddenTagCount > 0 && (
              <View style={[styles.moreTagsBadge, { backgroundColor: colors.surface }]}>
                <Text style={[styles.moreTagsText, { color: colors.textMuted }]}>
                  +{hiddenTagCount}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Recycle bin remaining days */}
        {showRecycleDays && note.recycleRemainDays !== undefined && (
          <Text style={[styles.recycleDays, { color: colors.accentOrange }]}>
            ⏱ {note.recycleRemainDays}天後永久刪除
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  timestamp: {
    fontSize: 12,
    fontWeight: '500',
  },
  pinnedIcon: {
    fontSize: 12,
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  contentWrapper: {
    marginBottom: 8,
  },
  imagesRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 6,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 6,
  },
  moreImages: {
    width: 72,
    height: 72,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreImagesText: {
    fontSize: 14,
    fontWeight: '600',
  },
  expandBtn: {
    marginBottom: 8,
  },
  expandText: {
    fontSize: 13,
    fontWeight: '500',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  moreTagsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  moreTagsText: {
    fontSize: 12,
    fontWeight: '500',
  },
  recycleDays: {
    fontSize: 11,
    marginTop: 6,
  },
});
