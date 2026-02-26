// Note entity
export interface NoteImage {
  id: string;
  noteId: string;
  uri: string;
  order: number;
}

export interface Note {
  id: string;
  content: string;
  tags: string[];
  images: NoteImage[];
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
  inRecycleBin: boolean;
  recycleRemainDays?: number;
  isPinned?: boolean;
}

// Tag entity
export interface Tag {
  id: string;
  name: string;
  noteCount: number;
  order: number;
}

// Settings entity
export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppSettings {
  theme: ThemeMode;
  backupPath: string;
  importExportHistory: string[];
}

// Recycle bin
export interface RecycleBinItem {
  note: Note;
  deletedAt: number;
  remainDays: number;
}

// Search / filter
export interface SearchFilter {
  query: string;
  tags: string[];
  dateFrom?: number;
  dateTo?: number;
  hasImages?: boolean;
  logicMode: 'AND' | 'OR';
}

// Export types
export type NoteStatus = 'active' | 'pinned' | 'deleted';
