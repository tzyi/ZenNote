import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useColors } from '../theme';
import { useNotesStore, useTagsStore, useSettingsStore } from '../store';
import { StorageService } from '../services/storageService';

export function ResetPanel() {
  const colors = useColors();
  const { setNotes } = useNotesStore();
  const { setTags } = useTagsStore();
  const { updateSettings } = useSettingsStore();

  const handleReset = useCallback(() => {
    Alert.alert(
      '⚠️ 一鍵重設',
      '此操作將清除所有資料（筆記、標籤、設定），並恢復初始狀態。\n\n此操作無法復原！',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確定重設',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              '最後確認',
              '你確定嗎？所有資料將永久刪除。',
              [
                { text: '取消', style: 'cancel' },
                {
                  text: '重設',
                  style: 'destructive',
                  onPress: async () => {
                    await StorageService.clearAll();
                    setNotes([]);
                    setTags([]);
                    updateSettings({
                      theme: 'dark',
                      backupPath: '',
                      importExportHistory: [],
                    });
                    Alert.alert('重設完成', '所有資料已清除');
                  },
                },
              ]
            );
          },
        },
      ]
    );
  }, [setNotes, setTags, updateSettings]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleReset}
        style={[styles.resetBtn, { backgroundColor: colors.accentRed }]}
      >
        <Text style={styles.resetIcon}>⚠️</Text>
        <View style={styles.resetContent}>
          <Text style={[styles.resetTitle, { color: colors.textInverse }]}>
            一鍵重設
          </Text>
          <Text style={[styles.resetSubtitle, { color: colors.textInverse }]}>
            清除所有資料，恢復初始狀態
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
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  resetIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  resetContent: {
    flex: 1,
  },
  resetTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  resetSubtitle: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.8,
  },
});
