import * as FileSystem from 'expo-file-system/legacy';
import { Note, NoteImage } from '../models';

const NOTE_IMAGES_DIR = 'note_images/';

/**
 * 確保永久圖片目錄存在並返回路徑。
 */
async function ensureImageDir(): Promise<string> {
  const dir = `${FileSystem.documentDirectory}${NOTE_IMAGES_DIR}`;
  const dirInfo = await FileSystem.getInfoAsync(dir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
  return dir;
}

/**
 * 產生唯一的圖片檔名。
 */
function uniqueImageFilename(originalUri: string): string {
  const ext = originalUri.split('.').pop()?.toLowerCase().split('?')[0] ?? 'jpg';
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
}

/**
 * 將圖片從臨時/快取 URI 複製到應用程式的永久文件目錄。
 * 確保清除快取後圖片依然存在。
 * @returns 永久目錄中的 file URI
 */
export async function copyImageToPermanentStorage(tempUri: string): Promise<string> {
  const dir = await ensureImageDir();
  const filename = uniqueImageFilename(tempUri);
  const destUri = `${dir}${filename}`;
  await FileSystem.copyAsync({ from: tempUri, to: destUri });
  return destUri;
}

/**
 * 判斷圖片 URI 是否已在永久儲存目錄（note_images 或 imported_images）。
 */
function isInPermanentStorage(uri: string): boolean {
  return uri.includes(`/${NOTE_IMAGES_DIR}`) || uri.includes('/imported_images/');
}

/**
 * 判斷 URI 是否為快取或臨時路徑（需要遷移）。
 */
function isCacheOrTempUri(uri: string, cacheDir: string): boolean {
  if (!uri.startsWith('file://')) return false;
  if (isInPermanentStorage(uri)) return false;
  return (
    uri.startsWith(cacheDir) ||
    uri.includes('/cache/') ||
    uri.includes('/tmp/') ||
    uri.includes('/temp/')
  );
}

/**
 * 遷移一個 NoteImage：若 URI 指向快取目錄且檔案仍存在，複製到永久目錄。
 * 若檔案已消失（快取已清除），保留舊 URI（圖片顯示空白，但不會崩潰）。
 */
async function migrateImage(img: NoteImage, cacheDir: string): Promise<NoteImage> {
  if (isInPermanentStorage(img.uri)) return img;
  if (!isCacheOrTempUri(img.uri, cacheDir)) return img;

  try {
    const fileInfo = await FileSystem.getInfoAsync(img.uri);
    if (fileInfo.exists) {
      const permanentUri = await copyImageToPermanentStorage(img.uri);
      return { ...img, uri: permanentUri };
    }
  } catch {
    // 無法取得檔案資訊，維持原 URI
  }
  return img;
}

/**
 * 遷移所有筆記中仍位於快取目錄的圖片到永久目錄。
 * 在 APP 啟動時（hydrateNotes）呼叫一次，確保向下相容。
 * @returns 遷移後的 notes 陣列（若無需遷移則返回原陣列）
 */
export async function migrateNoteImages(notes: Note[]): Promise<Note[]> {
  const cacheDir = FileSystem.cacheDirectory ?? '';
  if (!cacheDir) return notes;

  // 快速判斷是否有任何需要遷移的圖片
  const needsMigration = notes.some((note) =>
    note.images?.some((img) => isCacheOrTempUri(img.uri, cacheDir))
  );
  if (!needsMigration) return notes;

  return Promise.all(
    notes.map(async (note) => {
      if (!note.images?.length) return note;
      const migratedImages = await Promise.all(
        note.images.map((img) => migrateImage(img, cacheDir))
      );
      // 只在有變更時建立新物件
      const changed = migratedImages.some((img, i) => img !== note.images[i]);
      return changed ? { ...note, images: migratedImages } : note;
    })
  );
}
