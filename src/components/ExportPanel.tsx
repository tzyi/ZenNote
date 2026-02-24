import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useColors } from '../theme';
import { useNotesStore } from '../store';
import { ExportService } from '../services/exportService';

export function ExportPanel() {
  const colors = useColors();
  const { notes } = useNotesStore();
  const activeNotes = notes.filter((n) => !n.inRecycleBin);

  const handleExport = useCallback(() => {
    if (activeNotes.length === 0) {
      Alert.alert('無筆記', '沒有可匯出的筆記');
      return;
    }

    Alert.alert(
      '匯出全部筆記',
      `將匯出 ${activeNotes.length} 篇筆記為 Markdown 格式（含圖片連結）`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '匯出',
          onPress: () => ExportService.shareNotes(activeNotes),
        },
      ]
    );
  }, [activeNotes]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleExport}
        style={[styles.exportBtn, { backgroundColor: colors.accentGreen }]}
      >
        <Text style={styles.exportIcon}>📤</Text>
        <View style={styles.exportContent}>
          <Text style={[styles.exportTitle, { color: colors.textInverse }]}>
            匯出全部筆記
          </Text>
          <Text style={[styles.exportSubtitle, { color: colors.textInverse }]}>
            {activeNotes.length} 篇筆記 · Markdown 格式
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
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  exportIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  exportContent: {
    flex: 1,
  },
  exportTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  exportSubtitle: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.8,
  },
});
