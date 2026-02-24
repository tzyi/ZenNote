import { create } from 'zustand';
import { Note, Tag, AppSettings, ThemeMode } from '../models';

// ─── Notes Store ──────────────────────────────────────────────────────────────

interface NotesState {
  notes: Note[];
  draftContent: string;
  draftTags: string[];
  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  moveToRecycleBin: (id: string) => void;
  restoreFromRecycleBin: (id: string) => void;
  deleteNote: (id: string) => void;
  clearRecycleBin: () => void;
  togglePin: (id: string) => void;
  setDraftContent: (content: string) => void;
  setDraftTags: (tags: string[]) => void;
  clearDraft: () => void;
}

export const useNotesStore = create<NotesState>((set) => ({
  notes: [],
  draftContent: '',
  draftTags: [],

  setNotes: (notes) => set({ notes }),

  addNote: (note) =>
    set((state) => ({ notes: [note, ...state.notes] })),

  updateNote: (id, updates) =>
    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n
      ),
    })),

  moveToRecycleBin: (id) =>
    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === id
          ? { ...n, inRecycleBin: true, deletedAt: Date.now(), recycleRemainDays: 14 }
          : n
      ),
    })),

  restoreFromRecycleBin: (id) =>
    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === id
          ? { ...n, inRecycleBin: false, deletedAt: undefined, recycleRemainDays: undefined }
          : n
      ),
    })),

  deleteNote: (id) =>
    set((state) => ({ notes: state.notes.filter((n) => n.id !== id) })),

  clearRecycleBin: () =>
    set((state) => ({ notes: state.notes.filter((n) => !n.inRecycleBin) })),

  togglePin: (id) =>
    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === id ? { ...n, isPinned: !n.isPinned } : n
      ),
    })),

  setDraftContent: (draftContent) => set({ draftContent }),
  setDraftTags: (draftTags) => set({ draftTags }),
  clearDraft: () => set({ draftContent: '', draftTags: [] }),
}));

// ─── Tags Store ───────────────────────────────────────────────────────────────

interface TagsState {
  tags: Tag[];
  setTags: (tags: Tag[]) => void;
  addTag: (tag: Tag) => void;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
  reorderTags: (tags: Tag[]) => void;
}

export const useTagsStore = create<TagsState>((set) => ({
  tags: [],
  setTags: (tags) => set({ tags }),
  addTag: (tag) => set((state) => ({ tags: [...state.tags, tag] })),
  updateTag: (id, updates) =>
    set((state) => ({
      tags: state.tags.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  deleteTag: (id) => set((state) => ({ tags: state.tags.filter((t) => t.id !== id) })),
  reorderTags: (tags) => set({ tags }),
}));

// ─── Settings Store ───────────────────────────────────────────────────────────

interface SettingsState {
  settings: AppSettings;
  setTheme: (theme: ThemeMode) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: {
    theme: 'dark',
    backupPath: '',
    importExportHistory: [],
  },
  setTheme: (theme) =>
    set((state) => ({ settings: { ...state.settings, theme } })),
  updateSettings: (updates) =>
    set((state) => ({ settings: { ...state.settings, ...updates } })),
}));
