class FileMock {
  constructor(uri) {
    this.uri = uri;
  }
  async text() {
    return '';
  }
  async base64() {
    return '';
  }
}

module.exports = {
  File: FileMock,
  Directory: class DirectoryMock {},
  Paths: {
    cache: '/cache/',
    document: '/documents/',
  },
  // legacy compatibility stubs
  readAsStringAsync: jest.fn().mockResolvedValue(''),
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  getInfoAsync: jest.fn().mockResolvedValue({ exists: false }),
  makeDirectoryAsync: jest.fn().mockResolvedValue(undefined),
  EncodingType: {
    UTF8: 'utf8',
    Base64: 'base64',
  },
  cacheDirectory: '/cache/',
  documentDirectory: '/documents/',
  StorageAccessFramework: {
    requestDirectoryPermissionsAsync: jest.fn().mockResolvedValue({ granted: false }),
    createFileAsync: jest.fn().mockResolvedValue('file:///mock/path'),
  },
};
