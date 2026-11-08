import { parseJson, stringifyJson, isBigInteger, JsonParseError } from 'utils/shared/runner/values';

describe('parseJson', () => {
  it('reads every JSON value the way JSON.parse does', () => {
    const text = '{"a":[1,-2.5,1e3,true,false,null,"x\\n\\"\\u00e9"],"b":{}}';

    expect(parseJson(text)).toEqual(JSON.parse(text));
  });

  it('keeps integers beyond the safe range exact', () => {
    expect(parseJson('[9007199254740993,-9223372036854775808,9223372036854775807]')).toEqual([
      { $int: '9007199254740993' },
      { $int: '-9223372036854775808' },
      { $int: '9223372036854775807' },
    ]);
  });

  it('keeps safe integers and every non-integer as plain numbers', () => {
    expect(parseJson('[9007199254740991,-0,0.1,1.5e300]')).toEqual([
      9007199254740991, -0, 0.1, 1.5e300,
    ]);
  });

  it.each(['', '[1,]', '{"a" 1}', '"unterminated', '[1] 2', 'NaN', '01', '"\\x"'])(
    'rejects invalid JSON: %p',
    (text) => {
      expect(() => parseJson(text)).toThrow(JsonParseError);
    },
  );
});

describe('stringifyJson', () => {
  it('writes tagged big integers back as integer literals', () => {
    expect(stringifyJson({ n: { $int: '-9223372036854775808' }, list: [1, 'a'] })).toBe(
      '{"n":-9223372036854775808,"list":[1,"a"]}',
    );
  });

  it('round-trips through parseJson exactly', () => {
    const text = '{"big":9223372036854775807,"small":[1,2.5,null,"\\u0000"]}';

    expect(stringifyJson(parseJson(text))).toBe(text);
  });

  it('writes non-finite numbers as null', () => {
    expect(stringifyJson([NaN, Infinity])).toBe('[null,null]');
  });

  it('recognizes only the exact tagged shape as a big integer', () => {
    expect(isBigInteger({ $int: '1' })).toBe(true);
    expect(isBigInteger({ $int: '1', other: 2 })).toBe(false);
    expect(isBigInteger({ $int: 1 })).toBe(false);
  });
});
