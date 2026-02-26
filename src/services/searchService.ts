import { Note, SearchFilter } from '../models';

/**
 * Search & filter service for notes.
 */
export const SearchService = {
  /** Perform full-text search with multi-keyword AND/OR support */
  search(notes: Note[], filter: SearchFilter): Note[] {
    let result = notes.filter((n) => !n.inRecycleBin);

    // Tag filter
    if (filter.tags.length > 0) {
      if (filter.logicMode === 'AND') {
        result = result.filter((n) =>
          filter.tags.every((tag) =>
            n.tags.some((nt) => nt.toLowerCase().includes(tag.toLowerCase()))
          )
        );
      } else {
        result = result.filter((n) =>
          filter.tags.some((tag) =>
            n.tags.some((nt) => nt.toLowerCase().includes(tag.toLowerCase()))
          )
        );
      }
    }

    // Date range filter
    if (filter.dateFrom) {
      result = result.filter((n) => n.createdAt >= filter.dateFrom!);
    }
    if (filter.dateTo) {
      result = result.filter((n) => n.createdAt <= filter.dateTo!);
    }

    // Image filter
    if (filter.hasImages) {
      result = result.filter((n) => n.images.length > 0);
    }

    // Text search
    if (filter.query.trim()) {
      const keywords = filter.query.trim().toLowerCase().split(/\s+/);
      result = result.filter((n) => {
        const text = `${n.content} ${n.tags.join(' ')}`.toLowerCase();
        if (filter.logicMode === 'AND') {
          return keywords.every((kw) => text.includes(kw));
        }
        return keywords.some((kw) => text.includes(kw));
      });
    }

    // Sort by relevance (pinned first, then by date)
    return result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt - a.updatedAt;
    });
  },

  /** Fuzzy tag search */
  searchTags(allTags: string[], query: string): string[] {
    if (!query.trim()) return allTags;
    const q = query.toLowerCase();
    return allTags.filter((t) => t.toLowerCase().includes(q));
  },
};
