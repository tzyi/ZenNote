import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import { useColors } from '../theme';
import { useNotesStore } from '../store';
import { Note } from '../models';
import { NoteService } from '../services/noteService';

export function RecycleBinManager() {
  const colors = useColors();
  const { notes, restoreFromRecycleBin, deleteNote, clearRecycleBin } = useNotesStore();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const recycleBinNotes = useMemo(
    () => NoteService.getRecycleBinNotes(notes),
    [notes]
  );

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleBatchRestore = useCallback(() => {
    if (selectedIds.size === 0) return;
    Alert.alert('還原筆記', `確定要還原 ${selectedIds.size} 篇筆記？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '還原',
        onPress: () => {
          selectedIds.forEach((id) => restoreFromRecycleBin(id));
          setSelectedIds(new Set());
        },
      },
    ]);
  }, [selectedIds, restoreFromRecycleBin]);

  const handleBatchDelete = useCallback(() => {
    if (selectedIds.size === 0) return;
    Alert.alert(
      '永久刪除',
      `確定要永久刪除 ${selectedIds.size} 篇筆記？此操作無法復原。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '刪除',
          style: 'destructive',
          onPress: () => {
            selectedIds.forEach((id) => deleteNote(id));
            setSelectedIds(new Set());
          },
        },
      ]
    );
  }, [selectedIds, deleteNote]);

  const handleClearAll = useCallback(() => {
    if (recycleBinNotes.length === 0) return;
    Alert.alert(
      '全部清空',
      `確定要永久刪除 ${recycleBinNotes.length} 篇筆記？此操作無法復原。`,
      [
        { text: '取消', style: 'cancel' },
        { text: '清空', style: 'destructive', onPress: clearRecycleBin },
      ]
    );
  }, [recycleBinNotes.length, clearRecycleBin]);

  const renderItem = useCallback(
    ({ item }: { item: Note }) => {
      const isSelected = selectedIds.has(item.id);
      return (
        <TouchableOpacity
          onPress={() => toggleSelect(item.id)}
          style={[
            styles.noteRow,
            {
              backgroundColor: isSelected ? colors.surfaceVariant : colors.card,
              borderColor: isSelected ? colors.accentGreen : colors.border,
            },
          ]}
        >
          <View style={styles.noteContent}>
            <Text
              style={[styles.noteText, { color: colors.textPrimary }]}
              numberOfLines={2}
            >
              {item.content}
            </Text>
            <Text style={[styles.noteMeta, { color: colors.accentOrange }]}>
              ⏱ {item.recycleRemainDays ?? 0} 天後可清除
            </Text>
          </View>
          <View
            style={[
              styles.checkbox,
              {
                borderColor: isSelected ? colors.accentGreen : colors.border,
                backgroundColor: isSelected ? colors.accentGreen : 'transparent',
              },
            ]}
          >
            {isSelected && (
              <Text style={[styles.checkmark, { color: colors.textInverse }]}>✓</Text>
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [selectedIds, toggleSelect, colors]
  );

  return (
    <View style={styles.container}>
      {/* Actions bar */}
      <View style={[styles.actionsBar, { borderBottomColor: colors.divider }]}>
        <Text style={[styles.count, { color: colors.textMuted }]}>
          {recycleBinNotes.length} 篇在回收桶
        </Text>
        <View style={styles.actions}>
          {selectedIds.size > 0 && (
            <>
              <TouchableOpacity
                onPress={handleBatchRestore}
                style={[styles.actionBtn, { backgroundColor: colors.accentGreen }]}
              >
                <Text style={[styles.actionText, { color: colors.textInverse }]}>還原</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleBatchDelete}
                style={[styles.actionBtn, { backgroundColor: colors.accentRed }]}
              >
                <Text style={[styles.actionText, { color: colors.textInverse }]}>刪除</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={[styles.clearAllText, { color: colors.accentRed }]}>全部清空</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Note list */}
      <FlatList
        data={recycleBinNotes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>回收桶是空的</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  count: {
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  clearAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  list: {
    padding: 12,
    gap: 8,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  noteContent: {
    flex: 1,
    marginRight: 12,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 20,
  },
  noteMeta: {
    fontSize: 11,
    marginTop: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 14,
  },
});
