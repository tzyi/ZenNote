import { Note } from '../models';
import { Share, Alert, Platform } from 'react-native';

/**
 * Export notes as Markdown text.
 * In a production app, this would write to a .zip file with react-native-fs.
 * For now, we provide Markdown string generation and Share API.
 */
export const ExportService = {
  /** Convert a single note to Markdown string */
  noteToMarkdown(note: Note): string {
    const lines: string[] = [];
    const date = new Date(note.createdAt);
    const dateStr = date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    lines.push(`# 筆記 - ${dateStr}`);
    lines.push('');

    if (note.tags.length > 0) {
      lines.push(`**標籤**: ${note.tags.map((t) => `#${t}`).join(' ')}`);
      lines.push('');
    }

    lines.push(note.content);
    lines.push('');

    if (note.images.length > 0) {
      lines.push('## 圖片');
      note.images.forEach((img, i) => {
        lines.push(`![圖片 ${i + 1}](${img.uri})`);
      });
      lines.push('');
    }

    lines.push('---');
    lines.push(`*建立時間: ${dateStr}*`);
    if (note.updatedAt !== note.createdAt) {
      const updatedStr = new Date(note.updatedAt).toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
      lines.push(`*最後修改: ${updatedStr}*`);
    }

    return lines.join('\n');
  },

  /** Convert multiple notes to a combined Markdown document */
  notesToMarkdown(notes: Note[]): string {
    const header = `# ZenNote 匯出\n\n匯出時間: ${new Date().toLocaleDateString('zh-TW')}\n共 ${notes.length} 篇筆記\n\n---\n\n`;
    const body = notes.map((n) => ExportService.noteToMarkdown(n)).join('\n\n');
    return header + body;
  },

  /** Share notes as Markdown text using native Share API */
  async shareNotes(notes: Note[]): Promise<void> {
    if (notes.length === 0) {
      Alert.alert('無筆記', '沒有可匯出的筆記');
      return;
    }

    const markdown = ExportService.notesToMarkdown(notes);

    try {
      await Share.share({
        message: markdown,
        title: `ZenNote 匯出 - ${notes.length} 篇筆記`,
      });
    } catch (err) {
      Alert.alert('匯出失敗', '分享時發生錯誤，請再試一次');
    }
  },

  /** Share a single note */
  async shareNote(note: Note): Promise<void> {
    const markdown = ExportService.noteToMarkdown(note);
    try {
      await Share.share({
        message: markdown,
        title: '分享筆記',
      });
    } catch {
      Alert.alert('分享失敗', '分享時發生錯誤');
    }
  },
};
