import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { Card } from '../src/components';
import { useColors } from '../src/theme';
import { useNotesStore } from '../src/store';
import { Note } from '../src/models';
import { NoteService } from '../src/services/noteService';
import type { RootStackNavigationProp } from '../src/navigation/types';

export default function RecycleBinScreen() {
  const colors = useColors();
  const navigation = useNavigation<RootStackNavigationProp>();
  const { notes, restoreFromRecycleBin, deleteNote, clearRecycleBin } = useNotesStore();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  const recycleBinNotes = useMemo(
    () => NoteService.getRecycleBinNotes(notes),
    [notes]
  );

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      if (newSet.size === 0) {
        setSelectionMode(false);
      }
      return newSet;
    });
  }, []);

  const handleLongPress = useCallback((note: Note) => {
    setSelectionMode(true);
    setSelectedIds(new Set([note.id]));
  }, []);

  const handleBatchRestore = useCallback(() => {
    Alert.alert(
      '還原筆記',
      `確定要還原選中的 ${selectedIds.size} 篇筆記嗎？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '還原',
          onPress: () => {
            selectedIds.forEach((id) => restoreFromRecycleBin(id));
            setSelectedIds(new Set());
            setSelectionMode(false);
          },
        },
      ]
    );
  }, [selectedIds, restoreFromRecycleBin]);

  const handleBatchDelete = useCallback(() => {
    Alert.alert(
      '永久刪除',
      `確定要永久刪除選中的 ${selectedIds.size} 篇筆記嗎？此操作無法復原。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '刪除',
          style: 'destructive',
          onPress: () => {
            selectedIds.forEach((id) => deleteNote(id));
            setSelectedIds(new Set());
            setSelectionMode(false);
          },
        },
      ]
    );
  }, [selectedIds, deleteNote]);

  const handleClearAll = useCallback(() => {
    Alert.alert(
      '清空回收桶',
      `確定要永久刪除所有 ${recycleBinNotes.length} 篇筆記嗎？此操作無法復原。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '全部清空',
          style: 'destructive',
          onPress: clearRecycleBin,
        },
      ]
    );
  }, [recycleBinNotes.length, clearRecycleBin]);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === recycleBinNotes.length) {
      setSelectedIds(new Set());
      setSelectionMode(false);
    } else {
      setSelectedIds(new Set(recycleBinNotes.map((n) => n.id)));
    }
  }, [selectedIds.size, recycleBinNotes]);

  const renderItem = useCallback(
    ({ item }: { item: Note }) => {
      const isSelected = selectedIds.has(item.id);
      return (
        <TouchableOpacity
          onPress={() => {
            if (selectionMode) {
              toggleSelect(item.id);
            }
          }}
          onLongPress={() => handleLongPress(item)}
          activeOpacity={0.85}
        >
          <View
            style={[
              isSelected && {
                borderLeftWidth: 3,
                borderLeftColor: colors.accentGreen,
              },
            ]}
          >
            <Card
              note={item}
              onPress={() => {
                if (selectionMode) {
                  toggleSelect(item.id);
                }
              }}
              onLongPress={() => handleLongPress(item)}
              showRecycleDays
            />
          </View>
        </TouchableOpacity>
      );
    },
    [selectedIds, selectionMode, toggleSelect, handleLongPress, colors]
  );

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.divider }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.backBtn, { color: colors.textSecondary }]}>‹ 返回</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>回收桶</Text>
        <View style={styles.headerRight}>
          {recycleBinNotes.length > 0 && (
            <TouchableOpacity onPress={handleClearAll}>
              <Text style={[styles.clearAllBtn, { color: colors.accentRed }]}>全部清空</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Selection toolbar */}
      {selectionMode && (
        <View style={[styles.selectionBar, { backgroundColor: colors.surface }]}>
          <TouchableOpacity onPress={handleSelectAll}>
            <Text style={[styles.selectAllBtn, { color: colors.accentGreen }]}>
              {selectedIds.size === recycleBinNotes.length ? '取消全選' : '全選'}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.selectedCount, { color: colors.textSecondary }]}>
            已選 {selectedIds.size} 篇
          </Text>
          <View style={styles.selectionActions}>
            <TouchableOpacity
              onPress={handleBatchRestore}
              style={[styles.actionBtn, { backgroundColor: colors.accentGreen }]}
            >
              <Text style={[styles.actionBtnText, { color: colors.textInverse }]}>還原</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleBatchDelete}
              style={[styles.actionBtn, { backgroundColor: colors.accentRed }]}
            >
              <Text style={[styles.actionBtnText, { color: colors.textInverse }]}>刪除</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Info banner */}
      <View style={[styles.infoBanner, { backgroundColor: colors.surfaceVariant }]}>
        <Text style={[styles.infoText, { color: colors.textMuted }]}>
          回收桶中的筆記需手動刪除或清空。超過 14 天的筆記將於清空時刪除。
        </Text>
      </View>

      {/* List */}
      <FlashList
        data={recycleBinNotes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        estimatedItemSize={120}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyIcon, { color: colors.textMuted }]}>🗑️</Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              回收桶是空的
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    fontSize: 15,
    fontWeight: '500',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerRight: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  clearAllBtn: {
    fontSize: 13,
    fontWeight: '600',
  },
  selectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  selectAllBtn: {
    fontSize: 13,
    fontWeight: '600',
    marginRight: 12,
  },
  selectedCount: {
    fontSize: 13,
    flex: 1,
  },
  selectionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  infoBanner: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
  },
});
