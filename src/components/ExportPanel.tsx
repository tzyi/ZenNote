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
import { ExportService } from '../services/exportService';

export function ExportPanel() {
  const colors = useColors();
  const { notes } = useNotesStore();
  const activeNotes = notes.filter((n) => !n.inRecycleBin);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportZip = useCallback(() => {
    if (activeNotes.length === 0) {
      Alert.alert('無筆記', '沒有可匯出的筆記');
      return;
    }

    Alert.alert(
      '匯出全部筆記',
      `將 ${activeNotes.length} 篇筆記各自打包為獨立的 .md 檔案，並匯出成 .zip。\n\n接下來請選擇要儲存的資料夾。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '匯出 ZIP',
          onPress: async () => {
            setIsExporting(true);
            try {
              await ExportService.exportNotesToZip(activeNotes);
            } finally {
              setIsExporting(false);
            }
          },
        },
      ]
    );
  }, [activeNotes]);

  return (
    <View style={styles.container}>
      {/* ZIP export — primary action */}
      <TouchableOpacity
        onPress={handleExportZip}
        disabled={isExporting}
        style={[
          styles.exportBtn,
          { backgroundColor: colors.accentGreen },
          isExporting && styles.exportBtnDisabled,
        ]}
      >
        {isExporting ? (
          <ActivityIndicator color="#fff" style={styles.exportIcon} />
        ) : (
          <Text style={styles.exportIcon}>📦</Text>
        )}
        <View style={styles.exportContent}>
          <Text style={[styles.exportTitle, { color: colors.textInverse }]}>
            {isExporting ? '打包中…' : '匯出全部筆記 (.zip)'}
          </Text>
          <Text style={[styles.exportSubtitle, { color: colors.textInverse }]}>
            {activeNotes.length} 篇筆記 · 每篇獨立 .md · 選擇資料夾後儲存 .zip
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
  exportBtnDisabled: {
    opacity: 0.6,
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
