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

    it('should embed createdAt and updatedAt as machine-readable HTML comment', () => {
      const note = makeNote({ createdAt: 1700000000000, updatedAt: 1700111111111 });
      const md = ExportService.noteToMarkdown(note);
      expect(md).toContain('<!-- zennote:createdAt=1700000000000 updatedAt=1700111111111 -->');
    });

    it('should embed same timestamp when createdAt equals updatedAt', () => {
      const note = makeNote({ createdAt: 1700000000000, updatedAt: 1700000000000 });
      const md = ExportService.noteToMarkdown(note);
      expect(md).toContain('<!-- zennote:createdAt=1700000000000 updatedAt=1700000000000 -->');
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
    it('should parse markdown sections into note drafts', () => {
      const md = '# Note 1\n\nHello world\n\ntags: tag1, tag2\n\n---\n\n# Note 2\n\nGoodbye world';
      const notes = ImportService.parseMarkdown(md);
      expect(notes.length).toBeGreaterThanOrEqual(1);
      notes.forEach((n) => {
        // parseMarkdown returns Partial<Note> - id/inRecycleBin are set later by NoteService.createNote
        expect(n.content).toBeDefined();
        expect((n.content as string).length).toBeGreaterThan(0);
      });
    });

    it('should handle single note without separator', () => {
      const md = 'Just a simple note';
      const notes = ImportService.parseMarkdown(md);
      expect(notes.length).toBe(1);
      expect(notes[0].content).toBe('Just a simple note');
    });

    it('should preserve user-typed ![]() image links in content', () => {
      const md = `# 筆記 - 2024/01/01 00:00

Here is a link: ![logo](https://example.com/logo.png)
And another: ![diagram](./assets/diagram.svg)

## 圖片
![圖片 1](images/abc12345_0.jpg)

---
*建立時間: 2024/01/01 00:00*`;
      const notes = ImportService.parseMarkdown(md);
      expect(notes.length).toBe(1);
      // User-typed image links should be preserved
      expect(notes[0].content).toContain('![logo](https://example.com/logo.png)');
      expect(notes[0].content).toContain('![diagram](./assets/diagram.svg)');
      // Auto-generated export image links should be removed
      expect(notes[0].content).not.toContain('![圖片 1](images/abc12345_0.jpg)');
    });

    it('should restore original createdAt/updatedAt from embedded HTML comment', () => {
      const md = `# 筆記 - 2023/11/14 17:13\n\nSome content\n\n*建立時間: 2023/11/14 17:13*\n<!-- zennote:createdAt=1700000000000 updatedAt=1700111111111 -->`;
      const notes = ImportService.parseMarkdown(md);
      expect(notes.length).toBe(1);
      expect(notes[0].createdAt).toBe(1700000000000);
      expect(notes[0].updatedAt).toBe(1700111111111);
    });

    it('should return undefined timestamps when no HTML comment is present', () => {
      const md = `# My note\n\nSome content without timestamps`;
      const notes = ImportService.parseMarkdown(md);
      expect(notes.length).toBe(1);
      expect(notes[0].createdAt).toBeUndefined();
      expect(notes[0].updatedAt).toBeUndefined();
    });
  });

  describe('parseSingleMarkdownFile', () => {
    it('should restore original timestamps from embedded HTML comment', () => {
      const filename = 'MyNote.md';
      const content = `# 筆記 - 2023/11/14 17:13\n\n**標籤**: #hello #world\n\nNote body\n\n*建立時間: 2023/11/14 17:13*\n<!-- zennote:createdAt=1700000000000 updatedAt=1700111111111 -->`;
      const draft = ImportService.parseSingleMarkdownFile(filename, content);
      expect(draft).not.toBeNull();
      expect(draft!.createdAt).toBe(1700000000000);
      expect(draft!.updatedAt).toBe(1700111111111);
    });

    it('should clean header and metadata lines from content', () => {
      const filename = 'MyNote.md';
      const content = `# 筆記 - 2023/11/14 17:13\n\nActual content here\n\n*建立時間: 2023/11/14 17:13*\n<!-- zennote:createdAt=1700000000000 updatedAt=1700000000000 -->`;
      const draft = ImportService.parseSingleMarkdownFile(filename, content);
      expect(draft).not.toBeNull();
      expect(draft!.content).toBe('Actual content here');
      expect(draft!.content).not.toContain('# 筆記');
      expect(draft!.content).not.toContain('建立時間');
      expect(draft!.content).not.toContain('<!-- zennote:');
    });

    it('should extract tags from **標籤** line', () => {
      const filename = 'MyNote.md';
      const content = `# 筆記 - 2023/11/14 17:13\n\n**標籤**: #tagA #tagB\n\nContent here\n\n<!-- zennote:createdAt=1700000000000 updatedAt=1700000000000 -->`;
      const draft = ImportService.parseSingleMarkdownFile(filename, content);
      expect(draft).not.toBeNull();
      expect(draft!.tags).toEqual(['tagA', 'tagB']);
    });
  });

  describe('deduplicateNotes', () => {
    it('should filter out notes with matching content', () => {
      const existing = [makeNote({ content: 'Existing note' })];
      const incoming = [
        makeNote({ id: 'new1', content: 'Existing note' }),
        makeNote({ id: 'new2', content: 'Brand new note' }),
      ];
      // Correct argument order: deduplicateNotes(existingNotes, newNotes)
      const unique = ImportService.deduplicateNotes(existing, incoming);
      expect(unique.length).toBe(1);
      expect(unique[0].content).toBe('Brand new note');
    });

    it('should return all notes when no duplicates', () => {
      const existing = [makeNote({ content: 'A' })];
      const incoming = [makeNote({ id: 'b', content: 'B' }), makeNote({ id: 'c', content: 'C' })];
      const unique = ImportService.deduplicateNotes(existing, incoming);
      expect(unique.length).toBe(2);
    });
  });

  describe('export → import timestamp round-trip', () => {
    it('should preserve createdAt and updatedAt through export/import cycle', () => {
      // 1. Create a note with specific timestamps
      const originalNote = makeNote({
        content: 'Round-trip test content',
        tags: ['round', 'trip'],
        createdAt: 1700000000000,
        updatedAt: 1700555555555,
      });

      // 2. Export to Markdown
      const markdown = ExportService.noteToMarkdown(originalNote);

      // 3. Import from Markdown (single file parse)
      const draft = ImportService.parseSingleMarkdownFile('test.md', markdown);

      // 4. Verify timestamps are preserved exactly
      expect(draft).not.toBeNull();
      expect(draft!.createdAt).toBe(1700000000000);
      expect(draft!.updatedAt).toBe(1700555555555);
    });

    it('should preserve tags through export/import cycle', () => {
      const originalNote = makeNote({
        content: 'Tag preservation test',
        tags: ['alpha', 'beta', 'gamma'],
        createdAt: 1700000000000,
        updatedAt: 1700000000000,
      });

      const markdown = ExportService.noteToMarkdown(originalNote);
      const draft = ImportService.parseSingleMarkdownFile('test.md', markdown);

      expect(draft).not.toBeNull();
      expect(draft!.tags).toEqual(['alpha', 'beta', 'gamma']);
    });

    it('should preserve content through export/import cycle', () => {
      const originalNote = makeNote({
        content: '# Heading\n\nSome **bold** and _italic_ text.',
        tags: [],
        createdAt: 1700000000000,
        updatedAt: 1700000000000,
      });

      const markdown = ExportService.noteToMarkdown(originalNote);
      const draft = ImportService.parseSingleMarkdownFile('test.md', markdown);

      expect(draft).not.toBeNull();
      expect(draft!.content).toBe('# Heading\n\nSome **bold** and _italic_ text.');
    });
  });
});

