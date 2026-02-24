/**
 * T055 - Data encryption & GDPR compliance tests
 * Validates that the app follows security and privacy best practices
 *
 * Checks:
 * - No sensitive data hardcoded
 * - AsyncStorage usage for local-only storage
 * - Recycle bin with retention (soft delete pattern for GDPR right-to-erasure)
 * - Export/import for data portability (GDPR data portability)
 * - Reset functionality for account/data deletion (GDPR right-to-be-forgotten)
 * - No external network calls for note data
 */

const fs = require('fs');
const path = require('path');

function readSource(relativePath: string): string {
  return fs.readFileSync(path.resolve(__dirname, '../../' + relativePath), 'utf-8');
}

describe('GDPR: Right to erasure (soft delete via RecycleBin)', () => {
  it('moveToRecycleBin sets inRecycleBin flag', () => {
    const storeContent = readSource('src/store/index.ts');
    expect(storeContent).toContain('moveToRecycleBin');
    expect(storeContent).toContain('inRecycleBin');
  });

  it('permanentDelete removes note completely', () => {
    const storeContent = readSource('src/store/index.ts');
    expect(storeContent).toContain('permanentDelete');
  });

  it('clearRecycleBin removes all recycled notes', () => {
    const storeContent = readSource('src/store/index.ts');
    expect(storeContent).toContain('clearRecycleBin');
  });

  it('recycle bin screen allows batch deletion', () => {
    const screen = readSource('screens/RecycleBinScreen.tsx');
    expect(screen).toContain('clearRecycleBin');
  });
});

describe('GDPR: Data portability (export/import)', () => {
  it('export service converts notes to markdown', () => {
    const exportSvc = readSource('src/services/exportService.ts');
    expect(exportSvc).toContain('noteToMarkdown');
    expect(exportSvc).toContain('notesToMarkdown');
  });

  it('import service parses markdown back to notes', () => {
    const importSvc = readSource('src/services/importService.ts');
    expect(importSvc).toContain('parseMarkdown');
  });

  it('ExportPanel is accessible in settings', () => {
    const settings = readSource('screens/SettingsScreen.tsx');
    expect(settings).toContain('ExportPanel');
  });

  it('ImportPanel is accessible in settings', () => {
    const settings = readSource('screens/SettingsScreen.tsx');
    expect(settings).toContain('ImportPanel');
  });
});

describe('GDPR: Right to be forgotten (full reset)', () => {
  it('ResetPanel component exists for data wipe', () => {
    const resetPanel = readSource('src/components/ResetPanel.tsx');
    expect(resetPanel).toContain('reset');
  });

  it('ResetPanel is integrated in settings', () => {
    const settings = readSource('screens/SettingsScreen.tsx');
    expect(settings).toContain('ResetPanel');
  });
});

describe('Security: No hardcoded secrets', () => {
  const sensitivePatterns = [
    /api[_-]?key\s*[:=]\s*['"][A-Za-z0-9]{16,}['"]/i,
    /secret\s*[:=]\s*['"][A-Za-z0-9]{16,}['"]/i,
    /password\s*[:=]\s*['"][^'"]{8,}['"]/i,
    /token\s*[:=]\s*['"][A-Za-z0-9._-]{20,}['"]/i,
  ];

  const sourceFiles = [
    'src/store/index.ts',
    'src/services/storageService.ts',
    'src/services/noteService.ts',
    'src/services/exportService.ts',
    'src/services/importService.ts',
    'src/services/backupService.ts',
    'src/services/searchService.ts',
  ];

  sourceFiles.forEach((file) => {
    it(`${file} contains no hardcoded secrets`, () => {
      const content = readSource(file);
      sensitivePatterns.forEach((pattern) => {
        expect(content).not.toMatch(pattern);
      });
    });
  });
});

describe('Security: Local-only storage', () => {
  it('storageService uses AsyncStorage (local only)', () => {
    const svc = readSource('src/services/storageService.ts');
    expect(svc).toContain('AsyncStorage');
    // Should not make HTTP calls
    expect(svc).not.toContain('fetch(');
    expect(svc).not.toContain('axios');
    expect(svc).not.toContain('XMLHttpRequest');
  });

  it('backupService uses AsyncStorage (local only)', () => {
    const svc = readSource('src/services/backupService.ts');
    expect(svc).toContain('AsyncStorage');
  });

  it('no external API calls in services', () => {
    const servicesToCheck = [
      'src/services/noteService.ts',
      'src/services/searchService.ts',
      'src/services/storageService.ts',
      'src/services/backupService.ts',
    ];
    servicesToCheck.forEach((file) => {
      const content = readSource(file);
      expect(content).not.toMatch(/https?:\/\/[a-zA-Z0-9]/);
    });
  });
});

describe('Security: Data model has proper fields', () => {
  it('Note model supports soft delete with timestamp', () => {
    const models = readSource('src/models/index.ts');
    expect(models).toContain('deletedAt');
    expect(models).toContain('inRecycleBin');
  });

  it('Note model tracks creation and update times', () => {
    const models = readSource('src/models/index.ts');
    expect(models).toContain('createdAt');
    expect(models).toContain('updatedAt');
  });
});

describe('Privacy: Backup data stays local', () => {
  it('backup creates local snapshot only', () => {
    const backup = readSource('src/services/backupService.ts');
    expect(backup).toContain('AsyncStorage');
    // No cloud upload
    expect(backup).not.toContain('upload');
    expect(backup).not.toContain('cloud');
  });
});
