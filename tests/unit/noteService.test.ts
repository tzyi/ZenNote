/**
 * T053 - Unit tests for NoteService
 * Covers: generateId, calcRecycleRemainDays, createNote, getSortedNotes, getRecycleBinNotes
 */
import { NoteService } from '../../src/services/noteService';
import { Note } from '../../src/models';

describe('NoteService', () => {
  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = NoteService.generateId();
      const id2 = NoteService.generateId();
      expect(id1).not.toBe(id2);
    });

    it('should generate IDs with "note-" prefix', () => {
      const id = NoteService.generateId();
      expect(id).toMatch(/^note-/);
    });
  });

  describe('calcRecycleRemainDays', () => {
    it('should return 14 for just-deleted notes', () => {
      const days = NoteService.calcRecycleRemainDays(Date.now());
      expect(days).toBe(14);
    });

    it('should return less days for older deleted notes', () => {
      const sevenDaysAgo = Date.now() - 7 * 24 * 3600 * 1000;
      const days = NoteService.calcRecycleRemainDays(sevenDaysAgo);
      expect(days).toBe(7);
    });

    it('should return 0 for notes deleted 14+ days ago', () => {
      const fifteenDaysAgo = Date.now() - 15 * 24 * 3600 * 1000;
      const days = NoteService.calcRecycleRemainDays(fifteenDaysAgo);
      expect(days).toBe(0);
    });
  });

  describe('createNote', () => {
    it('should create a note with correct properties', () => {
      const note = NoteService.createNote('Hello World', ['tag1'], []);
      expect(note.content).toBe('Hello World');
      expect(note.tags).toEqual(['tag1']);
      expect(note.images).toEqual([]);
      expect(note.inRecycleBin).toBe(false);
      expect(note.id).toMatch(/^note-/);
      expect(note.createdAt).toBeDefined();
      expect(note.updatedAt).toBeDefined();
    });
  });

  describe('getSortedNotes', () => {
    const makeNote = (id: string, isPinned: boolean, createdAt: number): Note => ({
      id,
      content: `Note ${id}`,
      tags: [],
      images: [],
      createdAt,
      updatedAt: createdAt,
      inRecycleBin: false,
      isPinned,
    });

    it('should put pinned notes first', () => {
      const notes = [
        makeNote('a', false, 1000),
        makeNote('b', true, 500),
        makeNote('c', false, 2000),
      ];
      const sorted = NoteService.getSortedNotes(notes);
      expect(sorted[0].id).toBe('b');
    });

    it('should sort by createdAt descending within same pin status', () => {
      const notes = [
        makeNote('a', false, 1000),
        makeNote('b', false, 3000),
        makeNote('c', false, 2000),
      ];
      const sorted = NoteService.getSortedNotes(notes);
      expect(sorted.map((n) => n.id)).toEqual(['b', 'c', 'a']);
    });

    it('should exclude recycle bin notes', () => {
      const notes: Note[] = [
        { ...makeNote('a', false, 1000), inRecycleBin: true },
        makeNote('b', false, 2000),
      ];
      const sorted = NoteService.getSortedNotes(notes);
      expect(sorted.length).toBe(1);
      expect(sorted[0].id).toBe('b');
    });
  });

  describe('getRecycleBinNotes', () => {
    it('should return only recycle bin notes', () => {
      const notes: Note[] = [
        {
          id: 'a',
          content: 'active',
          tags: [],
          images: [],
          createdAt: 1000,
          updatedAt: 1000,
          inRecycleBin: false,
        },
        {
          id: 'b',
          content: 'deleted',
          tags: [],
          images: [],
          createdAt: 2000,
          updatedAt: 2000,
          inRecycleBin: true,
          deletedAt: Date.now(),
        },
      ];
      const recycled = NoteService.getRecycleBinNotes(notes);
      expect(recycled.length).toBe(1);
      expect(recycled[0].id).toBe('b');
    });
  });
});
