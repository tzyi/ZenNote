/**
 * T053 - Unit tests for ExportService and ImportService
 */
import { ExportService } from '../../src/services/exportService';
import { ImportService } from '../../src/services/importService';
import { Note } from '../../src/models';

const makeNote = (overrides: Partial<Note> = {}): Note => ({
  id: 'note-test-1',
  content: 'Test note content\nWith multiple lines',
  tags: ['tag1', 'tag2'],
  images: [],
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
  inRecycleBin: false,
  ...overrides,
});

describe('ExportService', () => {
  describe('noteToMarkdown', () => {
    it('should convert a note to markdown format', () => {
      const note = makeNote();
      const md = ExportService.noteToMarkdown(note);
      expect(md).toContain('Test note content');
      expect(md).toContain('With multiple lines');
      expect(md).toContain('tag1');
      expect(md).toContain('tag2');
    });

    it('should handle notes without tags', () => {
      const note = makeNote({ tags: [] });
      const md = ExportService.noteToMarkdown(note);
      expect(md).toContain('Test note content');
    });
  });

  describe('notesToMarkdown', () => {
    it('should join multiple notes with separator', () => {
      const notes = [makeNote({ id: 'n1' }), makeNote({ id: 'n2', content: 'Second note' })];
      const md = ExportService.notesToMarkdown(notes);
      expect(md).toContain('Test note content');
      expect(md).toContain('Second note');
      expect(md).toContain('---');
    });
  });
});

describe('ImportService', () => {
  describe('parseMarkdown', () => {
    it('should parse markdown into notes', () => {
      const md = '# Note 1\n\nHello world\n\ntags: tag1, tag2\n\n---\n\n# Note 2\n\nGoodbye world';
      const notes = ImportService.parseMarkdown(md);
      expect(notes.length).toBeGreaterThanOrEqual(1);
      notes.forEach((n) => {
        expect(n.id).toMatch(/^note-/);
        expect(n.content.length).toBeGreaterThan(0);
        expect(n.inRecycleBin).toBe(false);
      });
    });

    it('should handle single note without separator', () => {
      const md = 'Just a simple note';
      const notes = ImportService.parseMarkdown(md);
      expect(notes.length).toBe(1);
      expect(notes[0].content).toBe('Just a simple note');
    });
  });

  describe('deduplicateNotes', () => {
    it('should filter out notes with matching content', () => {
      const existing = [makeNote({ content: 'Existing note' })];
      const incoming = [
        makeNote({ id: 'new1', content: 'Existing note' }),
        makeNote({ id: 'new2', content: 'Brand new note' }),
      ];
      const unique = ImportService.deduplicateNotes(incoming, existing);
      expect(unique.length).toBe(1);
      expect(unique[0].content).toBe('Brand new note');
    });

    it('should return all notes when no duplicates', () => {
      const existing = [makeNote({ content: 'A' })];
      const incoming = [makeNote({ id: 'b', content: 'B' }), makeNote({ id: 'c', content: 'C' })];
      const unique = ImportService.deduplicateNotes(incoming, existing);
      expect(unique.length).toBe(2);
    });
  });
});
