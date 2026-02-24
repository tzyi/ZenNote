import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { DrawerActions } from '@react-navigation/native';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';

import { SidebarNav, Heatmap } from '../src/components';
import { useColors } from '../src/theme';
import { useNotesStore, useTagsStore } from '../src/store';
import type { RootStackNavigationProp } from '../src/navigation/types';

export default function SidebarScreen({ navigation }: DrawerContentComponentProps) {
  const colors = useColors();
  const { notes } = useNotesStore();
  const { tags, addTag, updateTag, deleteTag, reorderTags } = useTagsStore();

  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editTagName, setEditTagName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [showNewTag, setShowNewTag] = useState(false);

  const activeNotes = notes.filter((n) => !n.inRecycleBin);
  const recycleBinCount = notes.filter((n) => n.inRecycleBin).length;

  // Tag management: add new tag (T039)
  const handleAddTag = useCallback(() => {
    const trimmed = newTagName.trim();
    if (!trimmed) return;
    if (tags.some((t) => t.name === trimmed)) {
      Alert.alert('標籤已存在', `"${trimmed}" 已經存在`);
      return;
    }
    addTag({
      id: `tag-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: trimmed,
      noteCount: 0,
      order: tags.length,
    });
    setNewTagName('');
    setShowNewTag(false);
  }, [newTagName, tags, addTag]);

  // Tag management: start edit (T039)
  const handleStartEdit = useCallback((tagId: string, name: string) => {
    setEditingTagId(tagId);
    setEditTagName(name);
  }, []);

  // Tag management: save edit (T039)
  const handleSaveEdit = useCallback(() => {
    if (!editingTagId) return;
    const trimmed = editTagName.trim();
    if (trimmed) {
      updateTag(editingTagId, { name: trimmed });
    }
    setEditingTagId(null);
    setEditTagName('');
  }, [editingTagId, editTagName, updateTag]);

  // Tag management: delete (T039)
  const handleDeleteTag = useCallback(
    (tagId: string, tagName: string) => {
      Alert.alert('刪除標籤', `確定要刪除 "${tagName}" 嗎？`, [
        { text: '取消', style: 'cancel' },
        { text: '刪除', style: 'destructive', onPress: () => deleteTag(tagId) },
      ]);
    },
    [deleteTag]
  );

  // Tag management: move up/down for reorder (T039)
  const handleMoveTag = useCallback(
    (index: number, direction: 'up' | 'down') => {
      const newTags = [...tags];
      const swapIdx = direction === 'up' ? index - 1 : index + 1;
      if (swapIdx < 0 || swapIdx >= newTags.length) return;
      [newTags[index], newTags[swapIdx]] = [newTags[swapIdx], newTags[index]];
      reorderTags(newTags.map((t, i) => ({ ...t, order: i })));
    },
    [tags, reorderTags]
  );

  // Navigate to tag aggregate view (T040)
  const handleTagPress = useCallback(
    (tagName: string) => {
      navigation.dispatch(DrawerActions.closeDrawer());
      // Use the parent navigator to navigate to TagAggregate
      (navigation as unknown as { getParent: () => { navigate: (screen: string, params: Record<string, unknown>) => void } })
        .getParent()
        ?.navigate('TagAggregate', { tagName });
    },
    [navigation]
  );

  // Navigate to RecycleBin (T041)
  const handleRecycleBinPress = useCallback(() => {
    navigation.dispatch(DrawerActions.closeDrawer());
    (navigation as unknown as { getParent: () => { navigate: (screen: string) => void } })
      .getParent()
      ?.navigate('RecycleBin');
  }, [navigation]);

  const navItems = [
    {
      label: '全部筆記',
      icon: '📋',
      onPress: () => {
        navigation.navigate('Main');
        navigation.dispatch(DrawerActions.closeDrawer());
      },
      active: true,
    },
    {
      label: '每日回顧',
      icon: '🔄',
      onPress: () => {
        navigation.navigate('DailyReview');
        navigation.dispatch(DrawerActions.closeDrawer());
      },
    },
    {
      label: `回收桶 ${recycleBinCount > 0 ? `(${recycleBinCount})` : ''}`,
      icon: '🗑',
      onPress: handleRecycleBinPress,
    },
  ];

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.sidebar }]}
      edges={['top', 'left', 'bottom']}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Activity heatmap (T038) */}
        <Heatmap notes={notes} weeks={16} />

        {/* Stats */}
        <View style={[styles.statsRow, { borderColor: colors.divider }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.textPrimary }]}>
              {activeNotes.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>筆記</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.textPrimary }]}>
              {tags.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>標籤</Text>
          </View>
        </View>

        {/* Tags management section (T039) */}
        <View style={styles.tagsSection}>
          <View style={styles.tagsSectionHeader}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>標籤</Text>
            <TouchableOpacity onPress={() => setShowNewTag((p) => !p)}>
              <Text style={[styles.addBtn, { color: colors.accentGreen }]}>
                {showNewTag ? '取消' : '+ 新增'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* New tag input */}
          {showNewTag && (
            <Animated.View entering={FadeIn.duration(200)} style={styles.newTagRow}>
              <TextInput
                style={[styles.tagEditInput, { color: colors.textPrimary, borderColor: colors.border }]}
                value={newTagName}
                onChangeText={setNewTagName}
                onSubmitEditing={handleAddTag}
                placeholder="輸入標籤名稱"
                placeholderTextColor={colors.placeholder}
                autoFocus
                returnKeyType="done"
              />
              <TouchableOpacity onPress={handleAddTag} style={styles.confirmBtn}>
                <Text style={{ color: colors.accentGreen, fontWeight: '600' }}>✓</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Tag list with CRUD (T039) */}
          {tags.map((tag, index) => (
            <Animated.View
              key={tag.id}
              layout={Layout.springify()}
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(150)}
            >
              {editingTagId === tag.id ? (
                <View style={styles.tagEditRow}>
                  <TextInput
                    style={[styles.tagEditInput, { color: colors.textPrimary, borderColor: colors.border, flex: 1 }]}
                    value={editTagName}
                    onChangeText={setEditTagName}
                    onSubmitEditing={handleSaveEdit}
                    autoFocus
                    returnKeyType="done"
                  />
                  <TouchableOpacity onPress={handleSaveEdit} style={styles.confirmBtn}>
                    <Text style={{ color: colors.accentGreen, fontWeight: '600' }}>✓</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setEditingTagId(null)}
                    style={styles.confirmBtn}
                  >
                    <Text style={{ color: colors.textMuted }}>✕</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.tagItem}>
                  {/* Reorder buttons */}
                  <View style={styles.reorderBtns}>
                    <TouchableOpacity
                      onPress={() => handleMoveTag(index, 'up')}
                      disabled={index === 0}
                      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                    >
                      <Text
                        style={[
                          styles.reorderIcon,
                          { color: index === 0 ? colors.surfaceVariant : colors.textMuted },
                        ]}
                      >
                        ▲
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleMoveTag(index, 'down')}
                      disabled={index === tags.length - 1}
                      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                    >
                      <Text
                        style={[
                          styles.reorderIcon,
                          {
                            color:
                              index === tags.length - 1
                                ? colors.surfaceVariant
                                : colors.textMuted,
                          },
                        ]}
                      >
                        ▼
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Tag name - tap to navigate (T040) */}
                  <TouchableOpacity
                    style={styles.tagNameArea}
                    onPress={() => handleTagPress(tag.name)}
                    onLongPress={() => handleStartEdit(tag.id, tag.name)}
                  >
                    <Text style={[styles.tagName, { color: colors.accentGreen }]}>
                      #{tag.name}
                    </Text>
                    <Text style={[styles.tagCount, { color: colors.textMuted }]}>
                      {tag.noteCount}
                    </Text>
                  </TouchableOpacity>

                  {/* Delete button */}
                  <TouchableOpacity
                    onPress={() => handleDeleteTag(tag.id, tag.name)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={[styles.deleteIcon, { color: colors.accentRed }]}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          ))}

          {tags.length === 0 && (
            <Text style={[styles.emptyTags, { color: colors.textMuted }]}>
              尚無標籤，點擊「新增」建立
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Nav items and settings at bottom (T041, T042) */}
      <SidebarNav
        items={navItems}
        onSettingsPress={() => {
          navigation.navigate('Settings');
          navigation.dispatch(DrawerActions.closeDrawer());
        }}
        noteCount={activeNotes.length}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  tagsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tagsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addBtn: {
    fontSize: 13,
    fontWeight: '600',
  },
  newTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  tagEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 8,
  },
  tagEditInput: {
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
  },
  confirmBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  reorderBtns: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },
  reorderIcon: {
    fontSize: 8,
    lineHeight: 10,
  },
  tagNameArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tagName: {
    fontSize: 14,
  },
  tagCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  deleteIcon: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyTags: {
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
