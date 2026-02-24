import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useColors } from '../theme';
import { useNotesStore } from '../store';
import { ImportService } from '../services/importService';
import { NoteService } from '../services/noteService';

export function ImportPanel() {
  const colors = useColors();
  const { notes, addNote } = useNotesStore();

  const handleImport = useCallback(() => {
    // In production, this would use react-native-document-picker
    Alert.alert(
      '匯入筆記',
      '支援 .zip（含 Markdown 和圖片）或單個 Markdown 檔案。\n\n匯入時會自動去重，不會產生重複筆記。',
      [
        { text: '知道了' },
      ]
    );
  }, []);

  const handleImportMarkdown = useCallback(
    (markdownContent: string) => {
      const parsed = ImportService.parseMarkdown(markdownContent);
      const deduplicated = ImportService.deduplicateNotes(notes, parsed);

      if (deduplicated.length === 0) {
        Alert.alert('無新筆記', '匯入的內容皆已存在');
        return;
      }

      let imported = 0;
      for (const draft of deduplicated) {
        if (draft.content) {
          const note = NoteService.createNote(draft.content, draft.tags ?? []);
          addNote(note);
          imported++;
        }
      }

      Alert.alert('匯入完成', `成功匯入 ${imported} 篇筆記`);
    },
    [notes, addNote]
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleImport}
        style={[styles.importBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <Text style={styles.importIcon}>📥</Text>
        <View style={styles.importContent}>
          <Text style={[styles.importTitle, { color: colors.textPrimary }]}>
            匯入筆記
          </Text>
          <Text style={[styles.importSubtitle, { color: colors.textMuted }]}>
            支援 .zip 或 Markdown 格式
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  importIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  importContent: {
    flex: 1,
  },
  importTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  importSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});
