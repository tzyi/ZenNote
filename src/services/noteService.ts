import { Note, Tag } from '../models';
import { StorageService } from './storageService';

function generateId(): string {
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Calculate remaining recycle days for a note */
function calcRecycleRemainDays(deletedAt: number): number {
  const elapsed = Math.floor((Date.now() - deletedAt) / (1000 * 60 * 60 * 24));
  return Math.max(0, 14 - elapsed);
}

export const NoteService = {
  generateId,
  calcRecycleRemainDays,

  /** Create a new note object */
  createNote(content: string, tags: string[] = []): Note {
    const now = Date.now();
    return {
      id: generateId(),
      content,
      tags,
      images: [],
      createdAt: now,
      updatedAt: now,
      inRecycleBin: false,
    };
  },

  /** Update recycle remain days for all notes in recycle bin */
  refreshRecycleDays(notes: Note[]): Note[] {
    return notes.map((n) => {
      if (n.inRecycleBin && n.deletedAt) {
        return { ...n, recycleRemainDays: calcRecycleRemainDays(n.deletedAt) };
      }
      return n;
    });
  },

  /** Get notes sorted by pinned first, then by date descending */
  getSortedNotes(notes: Note[]): Note[] {
    return [...notes]
      .filter((n) => !n.inRecycleBin)
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.createdAt - a.createdAt;
      });
  },

  /** Get recycle bin notes with updated remain days */
  getRecycleBinNotes(notes: Note[]): Note[] {
    return notes
      .filter((n) => n.inRecycleBin)
      .map((n) => ({
        ...n,
        recycleRemainDays: n.deletedAt ? calcRecycleRemainDays(n.deletedAt) : 14,
      }))
      .sort((a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0));
  },
};
