import { Note } from '../models';
import { Share, Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import JSZip from 'jszip';

/**
 * Export notes as Markdown text or ZIP archive.
 * - noteToMarkdown / notesToMarkdown: generate Markdown strings
 * - exportNotesToZip: package every note as an individual .md file,
 *   bundle them into a .zip, write to temp storage, and open the
 *   system share/save sheet so the user can save to local storage.
 * - shareNotes / shareNote: legacy Share-API fallback (plain text)
 */
export const ExportService = {
  // ─── helpers ───────────────────────────────────────────────────────────────

  /** Zero-pad a number to 2 digits */
  _pad(n: number): string {
    return n.toString().padStart(2, '0');
  },

  /** Format a timestamp as "YYYYMMDD_HHmmss" (safe for filenames) */
  _formatFilenameDatetime(ts: number): string {
    const d = new Date(ts);
    return (
      `${d.getFullYear()}${ExportService._pad(d.getMonth() + 1)}${ExportService._pad(d.getDate())}` +
      `_${ExportService._pad(d.getHours())}${ExportService._pad(d.getMinutes())}${ExportService._pad(d.getSeconds())}`
    );
  },

  /** Format a timestamp for display */
  _formatDisplay(ts: number): string {
    return new Date(ts).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  /** Get image file extension from URI, defaulting to .jpg */
  _getImageExtension(uri: string): string {
    const cleanUri = uri.split('?')[0]?.split('#')[0] ?? uri;
    const match = cleanUri.match(/\.(\w+)$/);
    if (match) {
      const ext = match[1].toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'bmp'].includes(ext)) {
        return `.${ext}`;
      }
    }
    return '.jpg';
  },

  // ─── markdown generation ───────────────────────────────────────────────────

  /** Convert a single note to Markdown string */
  noteToMarkdown(note: Note, imageZipPaths?: string[]): string {
    const lines: string[] = [];
    const dateStr = ExportService._formatDisplay(note.createdAt);

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
        const path = imageZipPaths?.[i] ?? img.uri;
        lines.push(`![圖片 ${i + 1}](${path})`);
      });
      lines.push('');
    }

    lines.push('---');
    lines.push(`*建立時間: ${dateStr}*`);
    if (note.updatedAt !== note.createdAt) {
      lines.push(`*最後修改: ${ExportService._formatDisplay(note.updatedAt)}*`);
    }

    return lines.join('\n');
  },

  /** Convert multiple notes to a combined Markdown document */
  notesToMarkdown(notes: Note[]): string {
    const header =
      `# ZenNote 匯出\n\n` +
      `匯出時間: ${new Date().toLocaleDateString('zh-TW')}\n` +
      `共 ${notes.length} 篇筆記\n\n---\n\n`;
    const body = notes.map((n) => ExportService.noteToMarkdown(n)).join('\n\n');
    return header + body;
  },

  // ─── zip export ────────────────────────────────────────────────────────────

  /**
   * Package every note as an individual .md file inside a .zip archive.
   *
   * Android: uses StorageAccessFramework to let the user pick a folder,
   *          then saves the ZIP directly into that folder.
   * iOS:     writes to cache then opens the system share sheet so the user
   *          can choose "Save to Files" (or AirDrop, etc.).
   */
  async exportNotesToZip(notes: Note[]): Promise<void> {
    if (notes.length === 0) {
      Alert.alert('無筆記', '沒有可匯出的筆記');
      return;
    }

    try {
      const zip = new JSZip();
      const exportTs = ExportService._formatFilenameDatetime(Date.now());
      const zipFilename = `ZenNote_${exportTs}.zip`;

      // Track image metadata for _zennote_meta.json
      const imagesMeta: {
        noteFilename: string;
        images: { zipPath: string; id: string; order: number }[];
      }[] = [];

      // Add one .md file per note, plus image files
      for (const note of notes) {
        const fileDatetime = ExportService._formatFilenameDatetime(note.createdAt);
        const shortId = note.id.slice(0, 8);
        const filename = `note_${fileDatetime}_${shortId}.md`;

        const noteImageMeta: { zipPath: string; id: string; order: number }[] = [];
        const imageZipPaths: string[] = [];

        // Add images to ZIP
        for (const img of note.images) {
          try {
            const ext = ExportService._getImageExtension(img.uri);
            const imageZipPath = `images/${shortId}_${img.order}${ext}`;

            const imgBase64 = await FileSystem.readAsStringAsync(img.uri, {
              encoding: FileSystem.EncodingType.Base64,
            });

            zip.file(imageZipPath, imgBase64, { base64: true });
            imageZipPaths.push(imageZipPath);
            noteImageMeta.push({
              zipPath: imageZipPath,
              id: img.id,
              order: img.order,
            });
          } catch (err) {
            console.warn(`[ExportService] Failed to read image: ${img.uri}`, err);
            imageZipPaths.push(img.uri);
          }
        }

        zip.file(filename, ExportService.noteToMarkdown(note, imageZipPaths));

        if (noteImageMeta.length > 0) {
          imagesMeta.push({ noteFilename: filename, images: noteImageMeta });
        }
      }

      // Add image metadata JSON
      if (imagesMeta.length > 0) {
        zip.file(
          '_zennote_meta.json',
          JSON.stringify({ version: 1, notes: imagesMeta }, null, 2)
        );
      }

      // Add an index.md with a summary table
      const indexLines: string[] = [
        `# ZenNote 匯出`,
        ``,
        `匯出時間: ${new Date().toLocaleDateString('zh-TW', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })}`,
        `共 ${notes.length} 篇筆記`,
        ``,
        `| 檔案名稱 | 標籤 | 建立時間 |`,
        `| --- | --- | --- |`,
      ];
      notes.forEach((note) => {
        const fileDatetime = ExportService._formatFilenameDatetime(note.createdAt);
        const shortId = note.id.slice(0, 8);
        const filename = `note_${fileDatetime}_${shortId}.md`;
        const tags = note.tags.length > 0 ? note.tags.map((t) => `#${t}`).join(' ') : '—';
        indexLines.push(
          `| ${filename} | ${tags} | ${ExportService._formatDisplay(note.createdAt)} |`
        );
      });
      zip.file('index.md', indexLines.join('\n'));

      // Generate zip as base64
      const base64 = await zip.generateAsync({ type: 'base64' });

      if (Platform.OS === 'android') {
        // ── Android: SAF folder picker ────────────────────────────────────
        const SAF = FileSystem.StorageAccessFramework;
        const { granted, directoryUri } = await SAF.requestDirectoryPermissionsAsync();

        if (!granted) {
          // User cancelled – silent exit
          return;
        }

        // Create (or overwrite) the ZIP file in the chosen folder
        const fileUri = await SAF.createFileAsync(
          directoryUri,
          zipFilename,
          'application/zip'
        );
        await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: 'base64' as const,
        });

        Alert.alert('匯出成功', `已儲存至您選擇的資料夾：\n${zipFilename}`);
      } else {
        // ── iOS / other: write to cache then share ────────────────────────
        const zipPath = `${FileSystem.cacheDirectory}${zipFilename}`;
        await FileSystem.writeAsStringAsync(zipPath, base64, {
          encoding: 'base64' as const,
        });

        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(zipPath, {
            mimeType: 'application/zip',
            dialogTitle: `儲存 ZenNote 匯出檔`,
            UTI: 'public.zip-archive',
          });
        } else {
          Alert.alert('不支援分享', '此裝置不支援檔案分享功能');
        }
      }
    } catch (err) {
      console.error('[ExportService] exportNotesToZip error:', err);
      Alert.alert('匯出失敗', '建立 ZIP 時發生錯誤，請再試一次');
    }
  },

  // ─── legacy share ──────────────────────────────────────────────────────────

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
    } catch {
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
