/**
 * T053 - Unit tests for SearchService
 * Covers: search with AND/OR, tag filter, date range, image filter
 */
import { SearchService } from '../../src/services/searchService';
import { Note, SearchFilter } from '../../src/models';

const makeNote = (overrides: Partial<Note> = {}): Note => ({
  id: `note-${Math.random().toString(36).slice(2)}`,
  content: 'Default content',
  tags: [],
  images: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  inRecycleBin: false,
  ...overrides,
});

describe('SearchService', () => {
  const notes: Note[] = [
    makeNote({ id: 'n1', content: 'React Native tutorial', tags: ['tech', 'mobile'], createdAt: Date.now() - 86400000 * 2 }),
    makeNote({ id: 'n2', content: 'TypeScript advanced types', tags: ['tech'], createdAt: Date.now() - 86400000 }),
    makeNote({ id: 'n3', content: '買菜清單', tags: ['生活'], images: [{ id: 'img1', noteId: 'n3', uri: 'file://img.jpg', order: 0 }] }),
    makeNote({ id: 'n4', content: 'React hooks deep dive', tags: ['tech', 'react'], createdAt: Date.now() }),
    makeNote({ id: 'n5', content: 'deleted note', tags: [], inRecycleBin: true }),
  ];

  it('should perform AND keyword search', () => {
    const filter: SearchFilter = { query: 'React Native', tags: [], logicMode: 'AND' };
    const results = SearchService.search(notes, filter);
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('n1');
  });

  it('should perform OR keyword search', () => {
    const filter: SearchFilter = { query: 'React TypeScript', tags: [], logicMode: 'OR' };
    const results = SearchService.search(notes, filter);
    expect(results.length).toBe(3); // n1, n2, n4
  });

  it('should filter by tags', () => {
    const filter: SearchFilter = { query: '', tags: ['tech'], logicMode: 'AND' };
    const results = SearchService.search(notes, filter);
    expect(results.length).toBe(3); // n1, n2, n4
  });

  it('should filter by date range', () => {
    const now = Date.now();
    const filter: SearchFilter = {
      query: '',
      tags: [],
      logicMode: 'AND',
      dateFrom: now - 86400000, // last 1 day
      dateTo: now,
    };
    const results = SearchService.search(notes, filter);
    expect(results.every((n) => n.createdAt >= filter.dateFrom!)).toBe(true);
  });

  it('should filter notes with images', () => {
    const filter: SearchFilter = { query: '', tags: [], logicMode: 'AND', hasImages: true };
    const results = SearchService.search(notes, filter);
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('n3');
  });

  it('should exclude recycle bin notes', () => {
    const filter: SearchFilter = { query: 'deleted', tags: [], logicMode: 'AND' };
    const results = SearchService.search(notes, filter);
    expect(results.length).toBe(0);
  });

  it('should return all non-recycled notes when no filters', () => {
    const filter: SearchFilter = { query: '', tags: [], logicMode: 'AND' };
    const results = SearchService.search(notes, filter);
    expect(results.length).toBe(4);
  });
});

describe('SearchService.searchTags', () => {
  const tags = [
    { id: 't1', name: 'technology', noteCount: 5, order: 0 },
    { id: 't2', name: 'travel', noteCount: 3, order: 1 },
    { id: 't3', name: '生活', noteCount: 10, order: 2 },
    { id: 't4', name: 'tech-blog', noteCount: 2, order: 3 },
  ];

  it('should fuzzy match tags', () => {
    const results = SearchService.searchTags(tags, 'tech');
    expect(results.map((t) => t.id)).toContain('t1');
    expect(results.map((t) => t.id)).toContain('t4');
  });

  it('should return all tags when query is empty', () => {
    const results = SearchService.searchTags(tags, '');
    expect(results.length).toBe(4);
  });

  it('should match Chinese characters', () => {
    const results = SearchService.searchTags(tags, '生活');
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('t3');
  });
});
