/**
 * T053 - Unit tests for BackupService and StorageService
 */
import { BackupService } from '../../src/services/backupService';
import { StorageService } from '../../src/services/storageService';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

describe('StorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have static methods', () => {
    expect(typeof StorageService.loadNotes).toBe('function');
    expect(typeof StorageService.saveNotes).toBe('function');
    expect(typeof StorageService.loadTags).toBe('function');
    expect(typeof StorageService.saveTags).toBe('function');
    expect(typeof StorageService.loadSettings).toBe('function');
    expect(typeof StorageService.saveSettings).toBe('function');
  });
});

describe('BackupService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have static methods', () => {
    expect(typeof BackupService.createBackup).toBe('function');
    expect(typeof BackupService.restoreBackup).toBe('function');
    expect(typeof BackupService.getBackupInfo).toBe('function');
  });
});
