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
  EncodingType: {
    UTF8: 'utf8',
    Base64: 'base64',
  },
  CacheDirectory: '/cache/',
  DocumentDirectory: '/documents/',
};
