import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note, Tag, AppSettings } from '../models';

const KEYS = {
  NOTES: '@zennote/notes',
  TAGS: '@zennote/tags',
  SETTINGS: '@zennote/settings',
} as const;

export const StorageService = {
  // ─── Notes ────────────────────────────────────────────────────────
  async loadNotes(): Promise<Note[]> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.NOTES);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async saveNotes(notes: Note[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.NOTES, JSON.stringify(notes));
  },

  // ─── Tags ─────────────────────────────────────────────────────────
  async loadTags(): Promise<Tag[]> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.TAGS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async saveTags(tags: Tag[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.TAGS, JSON.stringify(tags));
  },

  // ─── Settings ─────────────────────────────────────────────────────
  async loadSettings(): Promise<AppSettings> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
      return raw
        ? JSON.parse(raw)
        : { theme: 'dark', backupPath: '', importExportHistory: [] };
    } catch {
      return { theme: 'dark', backupPath: '', importExportHistory: [] };
    }
  },

  async saveSettings(settings: AppSettings): Promise<void> {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  // ─── Reset ────────────────────────────────────────────────────────
  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove([KEYS.NOTES, KEYS.TAGS, KEYS.SETTINGS]);
  },
};
