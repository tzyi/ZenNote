import { create } from 'zustand';
import { Note, Tag, AppSettings, ThemeMode } from '../models';
import { StorageService } from '../services/storageService';

// ─── Persistence helpers ──────────────────────────────────────────────────────

let notesSaveTimer: ReturnType<typeof setTimeout> | null = null;
function debouncedSaveNotes(notes: Note[]) {
  if (notesSaveTimer) clearTimeout(notesSaveTimer);
  notesSaveTimer = setTimeout(() => {
    StorageService.saveNotes(notes);
  }, 300);
}

let tagsSaveTimer: ReturnType<typeof setTimeout> | null = null;
function debouncedSaveTags(tags: Tag[]) {
  if (tagsSaveTimer) clearTimeout(tagsSaveTimer);
  tagsSaveTimer = setTimeout(() => {
    StorageService.saveTags(tags);
  }, 300);
}

let settingsSaveTimer: ReturnType<typeof setTimeout> | null = null;
function debouncedSaveSettings(settings: AppSettings) {
  if (settingsSaveTimer) clearTimeout(settingsSaveTimer);
  settingsSaveTimer = setTimeout(() => {
    StorageService.saveSettings(settings);
  }, 300);
}

// ─── Notes Store ──────────────────────────────────────────────────────────────

interface NotesState {
  notes: Note[];
  draftContent: string;
  draftTags: string[];
  hydrated: boolean;
  hydrateNotes: () => Promise<void>;
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

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  draftContent: '',
  draftTags: [],
  hydrated: false,

  hydrateNotes: async () => {
    const notes = await StorageService.loadNotes();
    set({ notes, hydrated: true });
  },

  setNotes: (notes) => {
    set({ notes });
    debouncedSaveNotes(notes);
  },

  addNote: (note) => {
    const newNotes = [note, ...get().notes];
    set({ notes: newNotes });
    debouncedSaveNotes(newNotes);
    syncTagCounts(newNotes);
  },

  updateNote: (id, updates) => {
    const newNotes = get().notes.map((n) =>
      n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n
    );
    set({ notes: newNotes });
    debouncedSaveNotes(newNotes);
    syncTagCounts(newNotes);
  },

  moveToRecycleBin: (id) => {
    const newNotes = get().notes.map((n) =>
      n.id === id
        ? { ...n, inRecycleBin: true, deletedAt: Date.now(), recycleRemainDays: 14 }
        : n
    );
    set({ notes: newNotes });
    debouncedSaveNotes(newNotes);
    syncTagCounts(newNotes);
  },

  restoreFromRecycleBin: (id) => {
    const newNotes = get().notes.map((n) =>
      n.id === id
        ? { ...n, inRecycleBin: false, deletedAt: undefined, recycleRemainDays: undefined }
        : n
    );
    set({ notes: newNotes });
    debouncedSaveNotes(newNotes);
    syncTagCounts(newNotes);
  },

  deleteNote: (id) => {
    const newNotes = get().notes.filter((n) => n.id !== id);
    set({ notes: newNotes });
    debouncedSaveNotes(newNotes);
    syncTagCounts(newNotes);
  },

  clearRecycleBin: () => {
    const newNotes = get().notes.filter((n) => !n.inRecycleBin);
    set({ notes: newNotes });
    debouncedSaveNotes(newNotes);
    syncTagCounts(newNotes);
  },

  togglePin: (id) => {
    const newNotes = get().notes.map((n) =>
      n.id === id ? { ...n, isPinned: !n.isPinned } : n
    );
    set({ notes: newNotes });
    debouncedSaveNotes(newNotes);
  },

  setDraftContent: (draftContent) => set({ draftContent }),
  setDraftTags: (draftTags) => set({ draftTags }),
  clearDraft: () => set({ draftContent: '', draftTags: [] }),
}));

// ─── Tags Store ───────────────────────────────────────────────────────────────

interface TagsState {
  tags: Tag[];
  hydrated: boolean;
  hydrateTags: () => Promise<void>;
  setTags: (tags: Tag[]) => void;
  addTag: (tag: Tag) => void;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
  reorderTags: (tags: Tag[]) => void;
}

export const useTagsStore = create<TagsState>((set, get) => ({
  tags: [],
  hydrated: false,

  hydrateTags: async () => {
    const tags = await StorageService.loadTags();
    set({ tags, hydrated: true });
  },

  setTags: (tags) => {
    set({ tags });
    debouncedSaveTags(tags);
  },

  addTag: (tag) => {
    const newTags = [...get().tags, tag];
    set({ tags: newTags });
    debouncedSaveTags(newTags);
  },

  updateTag: (id, updates) => {
    const newTags = get().tags.map((t) => (t.id === id ? { ...t, ...updates } : t));
    set({ tags: newTags });
    debouncedSaveTags(newTags);
  },

  deleteTag: (id) => {
    const newTags = get().tags.filter((t) => t.id !== id);
    set({ tags: newTags });
    debouncedSaveTags(newTags);
  },

  reorderTags: (tags) => {
    set({ tags });
    debouncedSaveTags(tags);
  },
}));

// ─── Tag Count Sync ───────────────────────────────────────────────────────────
// Recalculates noteCount for all tags based on active (non-recycled) notes.
// Tags whose count drops to 0 are automatically deleted.
// Called as a regular function declaration so it is hoisted and usable in
// useNotesStore actions even though useTagsStore is declared after them.
function syncTagCounts(notes: Note[]) {
  const countMap: Record<string, number> = {};
  notes.forEach((note) => {
    if (!note.inRecycleBin) {
      note.tags.forEach((tagName) => {
        countMap[tagName] = (countMap[tagName] ?? 0) + 1;
      });
    }
  });

  const { tags, updateTag, deleteTag } = useTagsStore.getState();
  tags.forEach((tag) => {
    const newCount = countMap[tag.name] ?? 0;
    if (newCount === 0) {
      deleteTag(tag.id);
    } else if (tag.noteCount !== newCount) {
      updateTag(tag.id, { noteCount: newCount });
    }
  });
}

// ─── Settings Store ───────────────────────────────────────────────────────────

interface SettingsState {
  settings: AppSettings;
  hydrated: boolean;
  hydrateSettings: () => Promise<void>;
  setTheme: (theme: ThemeMode) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: {
    theme: 'dark',
    backupPath: '',
    importExportHistory: [],
  },
  hydrated: false,

  hydrateSettings: async () => {
    const settings = await StorageService.loadSettings();
    set({ settings, hydrated: true });
  },

  setTheme: (theme) => {
    const newSettings = { ...get().settings, theme };
    set({ settings: newSettings });
    debouncedSaveSettings(newSettings);
  },

  updateSettings: (updates) => {
    const newSettings = { ...get().settings, ...updates };
    set({ settings: newSettings });
    debouncedSaveSettings(newSettings);
  },
}));
