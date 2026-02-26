/**
 * T053 - Unit tests for Zustand stores
 * Tests useNotesStore, useTagsStore, useSettingsStore
 */
import { useNotesStore } from '../../src/store';
import { useTagsStore } from '../../src/store';
import { useSettingsStore } from '../../src/store';
import { Note, Tag } from '../../src/models';

describe('useNotesStore', () => {
  beforeEach(() => {
    useNotesStore.setState({ notes: [], draftContent: '', draftTags: [] });
  });

  const makeNote = (overrides: Partial<Note> = {}): Note => ({
    id: 'test-note-1',
    content: 'Test content',
    tags: ['tag1'],
    images: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    inRecycleBin: false,
    ...overrides,
  });

  it('should add a note', () => {
    const note = makeNote();
    useNotesStore.getState().addNote(note);
    expect(useNotesStore.getState().notes.length).toBe(1);
    expect(useNotesStore.getState().notes[0].id).toBe('test-note-1');
  });

  it('should update a note', () => {
    const note = makeNote();
    useNotesStore.getState().addNote(note);
    useNotesStore.getState().updateNote('test-note-1', { content: 'Updated content' });
    expect(useNotesStore.getState().notes[0].content).toBe('Updated content');
  });

  it('should move note to recycle bin', () => {
    const note = makeNote();
    useNotesStore.getState().addNote(note);
    useNotesStore.getState().moveToRecycleBin('test-note-1');
    const updated = useNotesStore.getState().notes[0];
    expect(updated.inRecycleBin).toBe(true);
    expect(updated.deletedAt).toBeDefined();
    expect(updated.recycleRemainDays).toBe(14);
  });

  it('should restore from recycle bin', () => {
    const note = makeNote({ inRecycleBin: true, deletedAt: Date.now(), recycleRemainDays: 10 });
    useNotesStore.getState().addNote(note);
    useNotesStore.getState().restoreFromRecycleBin('test-note-1');
    const updated = useNotesStore.getState().notes[0];
    expect(updated.inRecycleBin).toBe(false);
    expect(updated.deletedAt).toBeUndefined();
  });

  it('should permanently delete a note', () => {
    const note = makeNote();
    useNotesStore.getState().addNote(note);
    useNotesStore.getState().deleteNote('test-note-1');
    expect(useNotesStore.getState().notes.length).toBe(0);
  });

  it('should clear recycle bin', () => {
    useNotesStore.getState().addNote(makeNote({ id: 'active', inRecycleBin: false }));
    useNotesStore.getState().addNote(makeNote({ id: 'deleted', inRecycleBin: true }));
    useNotesStore.getState().clearRecycleBin();
    expect(useNotesStore.getState().notes.length).toBe(1);
    expect(useNotesStore.getState().notes[0].id).toBe('active');
  });

  it('should toggle pin', () => {
    const note = makeNote();
    useNotesStore.getState().addNote(note);
    useNotesStore.getState().togglePin('test-note-1');
    expect(useNotesStore.getState().notes[0].isPinned).toBe(true);
    useNotesStore.getState().togglePin('test-note-1');
    expect(useNotesStore.getState().notes[0].isPinned).toBe(false);
  });

  it('should manage drafts', () => {
    useNotesStore.getState().setDraftContent('Draft text');
    useNotesStore.getState().setDraftTags(['draft-tag']);
    expect(useNotesStore.getState().draftContent).toBe('Draft text');
    expect(useNotesStore.getState().draftTags).toEqual(['draft-tag']);
    useNotesStore.getState().clearDraft();
    expect(useNotesStore.getState().draftContent).toBe('');
    expect(useNotesStore.getState().draftTags).toEqual([]);
  });
});

describe('useTagsStore', () => {
  beforeEach(() => {
    useTagsStore.setState({ tags: [] });
  });

  const makeTag = (overrides: Partial<Tag> = {}): Tag => ({
    id: 'tag-1',
    name: 'test',
    noteCount: 0,
    order: 0,
    ...overrides,
  });

  it('should add a tag', () => {
    useTagsStore.getState().addTag(makeTag());
    expect(useTagsStore.getState().tags.length).toBe(1);
  });

  it('should update a tag', () => {
    useTagsStore.getState().addTag(makeTag());
    useTagsStore.getState().updateTag('tag-1', { name: 'updated' });
    expect(useTagsStore.getState().tags[0].name).toBe('updated');
  });

  it('should delete a tag', () => {
    useTagsStore.getState().addTag(makeTag());
    useTagsStore.getState().deleteTag('tag-1');
    expect(useTagsStore.getState().tags.length).toBe(0);
  });

  it('should reorder tags', () => {
    useTagsStore.getState().addTag(makeTag({ id: 't1', name: 'first', order: 0 }));
    useTagsStore.getState().addTag(makeTag({ id: 't2', name: 'second', order: 1 }));
    const reordered = [
      { id: 't2', name: 'second', noteCount: 0, order: 0 },
      { id: 't1', name: 'first', noteCount: 0, order: 1 },
    ];
    useTagsStore.getState().reorderTags(reordered);
    expect(useTagsStore.getState().tags[0].id).toBe('t2');
  });
});

describe('useSettingsStore', () => {
  it('should set theme', () => {
    useSettingsStore.getState().setTheme('light');
    expect(useSettingsStore.getState().settings.theme).toBe('light');
    useSettingsStore.getState().setTheme('dark');
    expect(useSettingsStore.getState().settings.theme).toBe('dark');
  });

  it('should update settings', () => {
    useSettingsStore.getState().updateSettings({ backupPath: '/some/path' });
    expect(useSettingsStore.getState().settings.backupPath).toBe('/some/path');
  });
});
