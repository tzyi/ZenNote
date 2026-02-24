import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const BACKUP_KEY = '@zennote/backup';

/**
 * Backup & Restore service using AsyncStorage.
 * In production, this would use react-native-fs for file-based backups.
 */
export const BackupService = {
  /** Create a full backup of all data */
  async createBackup(): Promise<boolean> {
    try {
      const keys = ['@zennote/notes', '@zennote/tags', '@zennote/settings'];
      const pairs = await AsyncStorage.multiGet(keys);
      const backup: Record<string, string | null> = {};

      for (const [key, value] of pairs) {
        backup[key] = value;
      }

      backup['@zennote/backup_timestamp'] = new Date().toISOString();
      await AsyncStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
      return true;
    } catch {
      Alert.alert('備份失敗', '無法建立備份，請再試一次');
      return false;
    }
  },

  /** Restore from backup */
  async restoreBackup(): Promise<boolean> {
    try {
      const raw = await AsyncStorage.getItem(BACKUP_KEY);
      if (!raw) {
        Alert.alert('無備份', '找不到可還原的備份');
        return false;
      }

      const backup: Record<string, string | null> = JSON.parse(raw);
      const pairs: [string, string][] = [];

      for (const [key, value] of Object.entries(backup)) {
        if (key !== '@zennote/backup_timestamp' && key !== BACKUP_KEY && value) {
          pairs.push([key, value]);
        }
      }

      await AsyncStorage.multiSet(pairs);
      return true;
    } catch {
      Alert.alert('還原失敗', '無法還原備份，請再試一次');
      return false;
    }
  },

  /** Check if backup exists and return its timestamp */
  async getBackupInfo(): Promise<string | null> {
    try {
      const raw = await AsyncStorage.getItem(BACKUP_KEY);
      if (!raw) return null;
      const backup = JSON.parse(raw);
      return backup['@zennote/backup_timestamp'] ?? null;
    } catch {
      return null;
    }
  },
};
