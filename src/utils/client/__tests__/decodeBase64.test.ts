import decodeBase64 from 'utils/client/decodeBase64';

const encode = (value: string) => Buffer.from(value, 'utf8').toString('base64');

describe('decodeBase64', () => {
  it('decodes ASCII', () => {
    expect(decodeBase64(encode("error TS1005: ';' expected."))).toBe("error TS1005: ';' expected.");
  });

  it('decodes multi-byte UTF-8 rather than showing one character per byte', () => {
    expect(decodeBase64(encode('naïve → 日本 ✓'))).toBe('naïve → 日本 ✓');
  });

  it.each([null, undefined, ''])('returns an empty string for %p', (value) => {
    expect(decodeBase64(value)).toBe('');
  });

  it('returns input that is not valid base64 unchanged', () => {
    expect(decodeBase64('not base64!')).toBe('not base64!');
  });
});
