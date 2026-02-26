import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Note } from '../models';
import { TagBadge } from './TagBadge';
import { useColors } from '../theme';

const MAX_COLLAPSED_LINES = 5;
const MAX_VISIBLE_TAGS = 5;

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
  const colors = useColors();

  const visibleTags = note.tags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenTagCount = note.tags.length - MAX_VISIBLE_TAGS;
  const hasMoreContent = note.content.split('\n').length > MAX_COLLAPSED_LINES
    || note.content.length > 400;

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

        {/* Content */}
        <Text
          style={[styles.content, { color: colors.textPrimary }]}
          numberOfLines={expanded ? undefined : MAX_COLLAPSED_LINES}
        >
          {note.content}
        </Text>

        {/* Images preview */}
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

        {/* Expand button */}
        {hasMoreContent && !expanded && (
          <TouchableOpacity
            onPress={() => setExpanded(true)}
            style={styles.expandBtn}
          >
            <Text style={[styles.expandText, { color: colors.accentGreen }]}>展開</Text>
          </TouchableOpacity>
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
