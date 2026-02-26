import { Note } from '../models';
import { Alert } from 'react-native';

/**
 * Import service for parsing Markdown content into notes.
 * In production, this would also handle .zip files with react-native-fs.
 */
export const ImportService = {
  /** Parse a Markdown string into a Note draft */
  parseMarkdown(markdownContent: string): Partial<Note>[] {
    // Split by --- separator to handle multi-note exports
    const sections = markdownContent.split(/\n---\n/).filter((s) => s.trim());
    const notes: Partial<Note>[] = [];

    for (const section of sections) {
      const lines = section.trim().split('\n');
      const content: string[] = [];
      const tags: string[] = [];

      for (const line of lines) {
        // Extract tags from **標籤**: #tag1 #tag2 pattern
        const tagMatch = line.match(/^\*\*標籤\*\*:\s*(.+)$/);
        if (tagMatch?.[1]) {
          const tagStr = tagMatch[1];
          const extracted = tagStr.match(/#(\S+)/g);
          if (extracted) {
            tags.push(...extracted.map((t) => t.replace(/^#/, '')));
          }
          continue;
        }

        // Skip header lines like "# 筆記 - ..." and metadata
        if (line.startsWith('# 筆記 - ') || line.startsWith('# ZenNote 匯出')) continue;
        if (line.startsWith('匯出時間:') || line.startsWith('共 ')) continue;
        if (line.startsWith('*建立時間:') || line.startsWith('*最後修改:')) continue;
        if (line.startsWith('## 圖片') || line.startsWith('![')) continue;

        content.push(line);
      }

      const trimmedContent = content.join('\n').trim();
      if (trimmedContent) {
        notes.push({
          content: trimmedContent,
          tags,
        });
      }
    }

    return notes;
  },

  /** Deduplicate notes by content hash */
  deduplicateNotes(existingNotes: Note[], newNotes: Partial<Note>[]): Partial<Note>[] {
    const existingContents = new Set(
      existingNotes.map((n) => n.content.trim().toLowerCase())
    );
    return newNotes.filter(
      (n) => n.content && !existingContents.has(n.content.trim().toLowerCase())
    );
  },
};
