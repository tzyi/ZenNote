import { Note, NoteImage } from '../models';
import { File } from 'expo-file-system';
import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import JSZip from 'jszip';

export interface ImportResult {
  total: number;
  imported: number;
  duplicates: number;
  errors: string[];
}

export interface ZipExtractResult {
  mdFiles: { filename: string; content: string }[];
  imageFiles: { zipPath: string; base64: string }[];
  meta: ZenNoteMeta | null;
}

export interface ZenNoteMeta {
  version: number;
  notes: {
    noteFilename: string;
    images: { zipPath: string; id: string; order: number }[];
  }[];
}

/**
 * Import service for parsing Markdown content into notes,
 * picking files from device, and extracting .zip archives.
 */
export const ImportService = {
  /**
   * Open document picker for .zip (single) or .md (multiple) files.
   * Returns the picked file assets or null if cancelled.
   */
  async pickMarkdownFiles(): Promise<DocumentPicker.DocumentPickerAsset[] | null> {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['text/markdown', 'text/plain', 'text/x-markdown', 'application/octet-stream'],
      multiple: true,
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.length) {
      return null;
    }

    // Filter to only .md files based on file name
    const mdAssets = result.assets.filter((a) =>
      a.name.toLowerCase().endsWith('.md')
    );
    return mdAssets.length > 0 ? mdAssets : null;
  },

  async pickZipFile(): Promise<DocumentPicker.DocumentPickerAsset | null> {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/zip', 'application/x-zip-compressed', 'application/octet-stream'],
      multiple: false,
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.length) {
      return null;
    }

    const asset = result.assets[0];
    if (!asset.name.toLowerCase().endsWith('.zip')) {
      return null;
    }
    return asset;
  },

  /**
   * Read a single .md file from its URI and return content string.
   */
  async readMarkdownFile(uri: string): Promise<string> {
    return await new File(uri).text();
  },

  /**
   * Extract all .md files from a .zip archive.
   * Returns an array of { filename, content } objects.
   */
  async extractMarkdownFromZip(
    zipUri: string
  ): Promise<{ filename: string; content: string }[]> {
    // Read zip as base64
    const base64 = await new File(zipUri).base64();

    const zip = await JSZip.loadAsync(base64, { base64: true });
    const mdFiles: { filename: string; content: string }[] = [];

    const entries = Object.entries(zip.files);
    for (const [path, file] of entries) {
      // Skip directories and non-.md files; also skip macOS resource forks
      if (file.dir) continue;
      if (path.startsWith('__MACOSX/')) continue;
      if (!path.toLowerCase().endsWith('.md')) continue;

      const content = await file.async('string');
      // Use just the filename, not the full path
      const filename = path.split('/').pop() ?? path;
      mdFiles.push({ filename, content });
    }

    return mdFiles;
  },

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

  /**
   * Parse a raw .md file as a single note.
   * Uses the filename (without .md) as a fallback title line if content is empty.
   */
  parseSingleMarkdownFile(
    filename: string,
    content: string
  ): Partial<Note> | null {
    const trimmed = content.trim();
    if (!trimmed) return null;

    // Extract tags from content
    const tags: string[] = [];
    const lines = trimmed.split('\n');
    const cleanLines: string[] = [];

    for (const line of lines) {
      const tagMatch = line.match(/^\*\*標籤\*\*:\s*(.+)$/);
      if (tagMatch?.[1]) {
        const extracted = tagMatch[1].match(/#(\S+)/g);
        if (extracted) {
          tags.push(...extracted.map((t) => t.replace(/^#/, '')));
        }
        continue;
      }

      // Skip ZenNote export headers, metadata, and image references
      if (line.startsWith('# 筆記 - ') || line.startsWith('# ZenNote 匯出')) continue;
      if (line.startsWith('匯出時間:') || line.startsWith('共 ')) continue;
      if (line.startsWith('*建立時間:') || line.startsWith('*最後修改:')) continue;
      if (line.startsWith('## 圖片') || line.startsWith('![')) continue;

      cleanLines.push(line);
    }

    const finalContent = cleanLines.join('\n').trim();
    if (!finalContent) return null;

    return { content: finalContent, tags };
  },

  /** Deduplicate notes by content hash */
  deduplicateNotes(
    existingNotes: Note[],
    newNotes: Partial<Note>[]
  ): Partial<Note>[] {
    const existingContents = new Set(
      existingNotes.map((n) => n.content.trim().toLowerCase())
    );
    return newNotes.filter(
      (n) => n.content && !existingContents.has(n.content.trim().toLowerCase())
    );
  },

  /**
   * Extract all content from a .zip archive including .md files,
   * image files (binary as base64), and _zennote_meta.json metadata.
   */
  async extractAllFromZip(zipUri: string): Promise<ZipExtractResult> {
    const base64 = await new File(zipUri).base64();
    const zip = await JSZip.loadAsync(base64, { base64: true });

    const mdFiles: { filename: string; content: string }[] = [];
    const imageFiles: { zipPath: string; base64: string }[] = [];
    let meta: ZenNoteMeta | null = null;

    const entries = Object.entries(zip.files);
    for (const [path, file] of entries) {
      if (file.dir) continue;
      if (path.startsWith('__MACOSX/')) continue;

      const filename = path.split('/').pop() ?? path;

      // _zennote_meta.json
      if (filename === '_zennote_meta.json') {
        try {
          const content = await file.async('string');
          meta = JSON.parse(content);
        } catch {}
        continue;
      }

      // .md files
      if (path.toLowerCase().endsWith('.md')) {
        const content = await file.async('string');
        mdFiles.push({ filename, content });
        continue;
      }

      // Image files
      if (/\.(jpg|jpeg|png|gif|webp|heic|bmp)$/i.test(path)) {
        const imgBase64 = await file.async('base64');
        imageFiles.push({ zipPath: path, base64: imgBase64 });
      }
    }

    return { mdFiles, imageFiles, meta };
  },

  /**
   * Save an imported image (base64) to the app's document directory.
   * Returns the local file URI.
   */
  async saveImportedImage(
    base64Data: string,
    filename: string
  ): Promise<string> {
    const dir = `${FileSystem.documentDirectory}imported_images/`;
    const dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }

    const uniqueFilename = `${Date.now()}_${Math.random().toString(36).slice(2, 5)}_${filename}`;
    const filePath = `${dir}${uniqueFilename}`;
    await FileSystem.writeAsStringAsync(filePath, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return filePath;
  },

  /**
   * Process images for a specific note based on ZIP extract results.
   * Saves images to local storage and returns NoteImage array.
   */
  async processNoteImages(
    noteFilename: string,
    extractResult: ZipExtractResult
  ): Promise<NoteImage[]> {
    if (!extractResult.meta) return [];

    const noteMeta = extractResult.meta.notes.find(
      (n) => n.noteFilename === noteFilename
    );
    if (!noteMeta || noteMeta.images.length === 0) return [];

    const images: NoteImage[] = [];
    for (const imgMeta of noteMeta.images) {
      const imageFile = extractResult.imageFiles.find(
        (f) => f.zipPath === imgMeta.zipPath
      );
      if (!imageFile) continue;

      try {
        const imgFilename =
          imgMeta.zipPath.split('/').pop() ?? `image_${imgMeta.order}.jpg`;
        const localUri = await ImportService.saveImportedImage(
          imageFile.base64,
          imgFilename
        );
        images.push({
          id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          noteId: '',
          uri: localUri,
          order: imgMeta.order,
        });
      } catch (err) {
        console.warn(
          `[ImportService] Failed to save image: ${imgMeta.zipPath}`,
          err
        );
      }
    }

    return images;
  },
};
