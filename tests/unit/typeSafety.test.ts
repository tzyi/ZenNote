/**
 * T054 - TypeScript type safety validation
 * Ensures all models and interfaces are correctly typed
 */
import {
  Note,
  NoteImage,
  Tag,
  AppSettings,
  ThemeMode,
  RecycleBinItem,
  SearchFilter,
  NoteStatus,
} from '../../src/models';

describe('Type Safety Validation', () => {
  describe('Note interface', () => {
    it('should accept valid Note objects', () => {
      const note: Note = {
        id: 'note-1',
        content: 'Hello',
        tags: ['tag1'],
        images: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        inRecycleBin: false,
      };
      expect(note.id).toBeDefined();
      expect(typeof note.content).toBe('string');
      expect(Array.isArray(note.tags)).toBe(true);
      expect(typeof note.inRecycleBin).toBe('boolean');
    });

    it('should accept optional fields', () => {
      const note: Note = {
        id: 'note-2',
        content: 'Test',
        tags: [],
        images: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        inRecycleBin: true,
        deletedAt: Date.now(),
        recycleRemainDays: 7,
        isPinned: true,
      };
      expect(note.deletedAt).toBeDefined();
      expect(note.recycleRemainDays).toBe(7);
      expect(note.isPinned).toBe(true);
    });
  });

  describe('NoteImage interface', () => {
    it('should have required fields', () => {
      const img: NoteImage = {
        id: 'img-1',
        noteId: 'note-1',
        uri: 'file://image.jpg',
        order: 0,
      };
      expect(img.id).toBeDefined();
      expect(typeof img.uri).toBe('string');
      expect(typeof img.order).toBe('number');
    });
  });

  describe('Tag interface', () => {
    it('should have required fields', () => {
      const tag: Tag = {
        id: 'tag-1',
        name: 'technology',
        noteCount: 5,
        order: 0,
      };
      expect(typeof tag.name).toBe('string');
      expect(typeof tag.noteCount).toBe('number');
    });
  });

  describe('AppSettings interface', () => {
    it('should accept valid settings', () => {
      const settings: AppSettings = {
        theme: 'dark',
        backupPath: '/path/to/backup',
        importExportHistory: ['2024-01-01'],
      };
      expect(settings.theme).toBe('dark');
      expect(Array.isArray(settings.importExportHistory)).toBe(true);
    });
  });

  describe('ThemeMode type', () => {
    it('should accept valid theme modes', () => {
      const modes: ThemeMode[] = ['light', 'dark', 'system'];
      expect(modes).toHaveLength(3);
      modes.forEach((m) => {
        expect(['light', 'dark', 'system']).toContain(m);
      });
    });
  });

  describe('SearchFilter interface', () => {
    it('should accept valid filter objects', () => {
      const filter: SearchFilter = {
        query: 'test',
        tags: ['tag1'],
        logicMode: 'AND',
      };
      expect(filter.query).toBe('test');
      expect(filter.logicMode).toBe('AND');
    });

    it('should accept optional date fields', () => {
      const filter: SearchFilter = {
        query: '',
        tags: [],
        logicMode: 'OR',
        dateFrom: Date.now() - 86400000,
        dateTo: Date.now(),
        hasImages: true,
      };
      expect(filter.dateFrom).toBeDefined();
      expect(filter.hasImages).toBe(true);
    });
  });

  describe('RecycleBinItem interface', () => {
    it('should have required fields', () => {
      const item: RecycleBinItem = {
        note: {
          id: 'note-1',
          content: 'Deleted',
          tags: [],
          images: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          inRecycleBin: true,
        },
        deletedAt: Date.now(),
        remainDays: 10,
      };
      expect(item.note.inRecycleBin).toBe(true);
      expect(typeof item.remainDays).toBe('number');
    });
  });

  describe('NoteStatus type', () => {
    it('should accept valid statuses', () => {
      const statuses: NoteStatus[] = ['active', 'pinned', 'deleted'];
      expect(statuses).toHaveLength(3);
    });
  });
});
