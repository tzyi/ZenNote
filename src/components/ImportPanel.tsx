import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useColors } from '../theme';
import { useNotesStore } from '../store';
import { ImportService, ImportResult } from '../services/importService';
import { NoteService } from '../services/noteService';
import { Note } from '../models';

export function ImportPanel() {
  const colors = useColors();
  const { notes, addNote } = useNotesStore();
  const [importing, setImporting] = useState(false);

  /** Core logic: take parsed note drafts, deduplicate, add to store */
  const processImportedNotes = useCallback(
    (drafts: Partial<Note>[]): ImportResult => {
      const result: ImportResult = {
        total: drafts.length,
        imported: 0,
        duplicates: 0,
        errors: [],
      };

      // Get the latest notes snapshot for dedup (include ones added in this batch)
      const currentNotes = useNotesStore.getState().notes;
      const deduplicated = ImportService.deduplicateNotes(currentNotes, drafts);
      result.duplicates = drafts.length - deduplicated.length;

      for (const draft of deduplicated) {
        try {
          if (draft.content) {
            const note = NoteService.createNote(
              draft.content,
              draft.tags ?? []
            );
            // Restore original timestamps if available (from ZenNote export metadata)
            if (draft.createdAt) note.createdAt = draft.createdAt;
            if (draft.updatedAt) note.updatedAt = draft.updatedAt;
            // Include images from the draft
            if (draft.images && draft.images.length > 0) {
              note.images = draft.images;
            }
            addNote(note);
            result.imported++;
          }
        } catch {
          result.errors.push('建立筆記失敗');
        }
      }
      return result;
    },
    [addNote]
  );

  /** Show result alert */
  const showResult = useCallback((result: ImportResult) => {
    if (result.imported === 0 && result.duplicates > 0) {
      Alert.alert('無新筆記', '匯入的內容皆已存在，已自動跳過重複筆記。');
      return;
    }
    if (result.imported === 0) {
      Alert.alert('匯入失敗', '未能匯入任何筆記，請確認檔案格式是否為 Markdown。');
      return;
    }

    let msg = `成功匯入 ${result.imported} 篇筆記`;
    if (result.duplicates > 0) {
      msg += `\n已跳過 ${result.duplicates} 篇重複筆記`;
    }
    if (result.errors.length > 0) {
      msg += `\n${result.errors.length} 個檔案處理失敗`;
    }
    Alert.alert('匯入完成', msg);
  }, []);

  /** Handle importing .md files (multi-select) */
  const handleImportMarkdown = useCallback(async () => {
    try {
      setImporting(true);
      const assets = await ImportService.pickMarkdownFiles();
      if (!assets) {
        setImporting(false);
        return;
      }

      const drafts: Partial<Note>[] = [];
      const errors: string[] = [];

      for (const asset of assets) {
        try {
          const content = await ImportService.readMarkdownFile(asset.uri);
          const parsed = ImportService.parseSingleMarkdownFile(
            asset.name,
            content
          );
          if (parsed) {
            drafts.push(parsed);
          }
        } catch {
          errors.push(asset.name);
        }
      }

      const result = processImportedNotes(drafts);
      result.errors.push(...errors);
      showResult(result);
    } catch (err: any) {
      Alert.alert('匯入錯誤', err?.message ?? '發生未知錯誤');
    } finally {
      setImporting(false);
    }
  }, [processImportedNotes, showResult]);

  /** Handle importing a .zip file (single select) */
  const handleImportZip = useCallback(async () => {
    try {
      setImporting(true);
      const asset = await ImportService.pickZipFile();
      if (!asset) {
        setImporting(false);
        return;
      }

      const extractResult = await ImportService.extractAllFromZip(asset.uri);

      if (extractResult.mdFiles.length === 0) {
        Alert.alert('無 Markdown 檔案', 'ZIP 壓縮包內未找到任何 .md 檔案。');
        setImporting(false);
        return;
      }

      const drafts: Partial<Note>[] = [];
      const errors: string[] = [];

      for (const { filename, content } of extractResult.mdFiles) {
        try {
          const parsed = ImportService.parseSingleMarkdownFile(
            filename,
            content
          );
          if (parsed) {
            // Process images for this note from the ZIP
            const images = await ImportService.processNoteImages(
              filename,
              extractResult
            );
            if (images.length > 0) {
              parsed.images = images;
            }
            drafts.push(parsed);
          }
        } catch {
          errors.push(filename);
        }
      }

      const result = processImportedNotes(drafts);
      result.errors.push(...errors);
      showResult(result);
    } catch (err: any) {
      Alert.alert('匯入錯誤', err?.message ?? '發生未知錯誤');
    } finally {
      setImporting(false);
    }
  }, [processImportedNotes, showResult]);

  /** Main import button: show action sheet to choose file type */
  const handleImport = useCallback(() => {
    if (importing) return;
    Alert.alert('匯入筆記', '請選擇匯入的檔案格式', [
      {
        text: 'Markdown 檔案 (.md)',
        onPress: handleImportMarkdown,
      },
      {
        text: 'ZIP 壓縮檔 (.zip)',
        onPress: handleImportZip,
      },
      { text: '取消', style: 'cancel' },
    ]);
  }, [importing, handleImportMarkdown, handleImportZip]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleImport}
        disabled={importing}
        style={[
          styles.importBtn,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        {importing ? (
          <ActivityIndicator
            size="small"
            color={colors.textPrimary}
            style={styles.importIcon}
          />
        ) : (
          <Text style={styles.importIcon}>📥</Text>
        )}
        <View style={styles.importContent}>
          <Text style={[styles.importTitle, { color: colors.textPrimary }]}>
            {importing ? '匯入中...' : '匯入筆記'}
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
