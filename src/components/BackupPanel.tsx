import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useColors } from '../theme';
import { BackupService } from '../services/backupService';

export function BackupPanel() {
  const colors = useColors();
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    BackupService.getBackupInfo().then(setLastBackup);
  }, []);

  const handleBackup = useCallback(async () => {
    setLoading(true);
    const success = await BackupService.createBackup();
    if (success) {
      const info = await BackupService.getBackupInfo();
      setLastBackup(info);
      Alert.alert('備份成功', '所有資料已備份至本機');
    }
    setLoading(false);
  }, []);

  const handleRestore = useCallback(async () => {
    if (!lastBackup) {
      Alert.alert('無備份', '找不到可還原的備份');
      return;
    }

    Alert.alert(
      '還原備份',
      '還原將覆蓋目前的資料，確定要繼續嗎？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '還原',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            const success = await BackupService.restoreBackup();
            if (success) {
              Alert.alert('還原成功', '資料已還原，請重新啟動 App 以生效');
            }
            setLoading(false);
          },
        },
      ]
    );
  }, [lastBackup]);

  const formatDate = (isoStr: string) => {
    try {
      return new Date(isoStr).toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <View style={styles.container}>
      {/* Backup info */}
      {lastBackup && (
        <View style={[styles.infoCard, { backgroundColor: colors.surfaceVariant }]}>
          <Text style={[styles.infoLabel, { color: colors.textMuted }]}>最近備份</Text>
          <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
            {formatDate(lastBackup)}
          </Text>
        </View>
      )}

      {/* Backup button */}
      <TouchableOpacity
        onPress={handleBackup}
        disabled={loading}
        style={[
          styles.btn,
          { backgroundColor: colors.accentGreen, opacity: loading ? 0.6 : 1 },
        ]}
      >
        <Text style={styles.btnIcon}>💾</Text>
        <Text style={[styles.btnText, { color: colors.textInverse }]}>
          {loading ? '處理中...' : '建立備份'}
        </Text>
      </TouchableOpacity>

      {/* Restore button */}
      <TouchableOpacity
        onPress={handleRestore}
        disabled={loading || !lastBackup}
        style={[
          styles.btn,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            opacity: loading || !lastBackup ? 0.5 : 1,
          },
        ]}
      >
        <Text style={styles.btnIcon}>♻️</Text>
        <Text style={[styles.btnText, { color: colors.textPrimary }]}>
          還原備份
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  infoCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    marginTop: 4,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
  },
  btnIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
