// JSON values that keep 64-bit integers exact.
//
// A program's output can hold integers beyond JavaScript's safe range
// (9007199254740993, or a C++ long's minimum). JSON.parse would round them, so
// outputs are parsed here instead: safe integers and other numbers become JS
// numbers, and any other integer is kept as { $int: '<digits>' }. That tagged
// form survives jsonb and GraphQL (JSON.stringify can't write a BigInt) and is
// compared by its digits.

export interface BigInteger {
  $int: string;
}

export const isBigInteger = (value: unknown): value is BigInteger =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as BigInteger).$int === 'string' &&
  Object.keys(value).length === 1;

// JSON integer literals are already canonical (no leading zeros), so an unsafe
// one is kept as its digits
const toNumber = (text: string): number | BigInteger => {
  if (/^-?\d+$/.test(text)) {
    const value = Number(text);
    return Number.isSafeInteger(value) ? value : { $int: text };
  }

  return Number(text);
};

export class JsonParseError extends Error {}

// A strict JSON parser that differs from JSON.parse only in how it reads numbers
export const parseJson = (text: string): unknown => {
  let index = 0;

  const fail = (message: string): never => {
    throw new JsonParseError(`${message} at position ${index}`);
  };

  const skipWhitespace = () => {
    while (index < text.length && ' \t\n\r'.includes(text[index])) {
      index++;
    }
  };

  const parseString = (): string => {
    // index is on the opening quote
    index++;
    let result = '';

    while (index < text.length) {
      const char = text[index++];

      if (char === '"') {
        return result;
      }

      if (char === '\\') {
        const escape = text[index++];
        const simple: Record<string, string> = {
          '"': '"',
          '\\': '\\',
          '/': '/',
          b: '\b',
          f: '\f',
          n: '\n',
          r: '\r',
          t: '\t',
        };

        if (escape in simple) {
          result += simple[escape];
        } else if (escape === 'u') {
          const hex = text.slice(index, index + 4);

          if (!/^[0-9a-fA-F]{4}$/.test(hex)) {
            fail('Invalid unicode escape');
          }

          result += String.fromCharCode(parseInt(hex, 16));
          index += 4;
        } else {
          fail('Invalid escape');
        }
      } else if (char < ' ') {
        fail('Unescaped control character in string');
      } else {
        result += char;
      }
    }

    return fail('Unterminated string');
  };

  const parseValue = (): unknown => {
    skipWhitespace();
    const char = text[index];

    if (char === '{') {
      index++;
      const object: Record<string, unknown> = {};
      skipWhitespace();

      if (text[index] === '}') {
        index++;
        return object;
      }

      for (;;) {
        skipWhitespace();

        if (text[index] !== '"') {
          fail('Expected a string key');
        }

        const key = parseString();
        skipWhitespace();

        if (text[index++] !== ':') {
          fail('Expected ":"');
        }

        object[key] = parseValue();
        skipWhitespace();
        const next = text[index++];

        if (next === '}') {
          return object;
        }

        if (next !== ',') {
          fail('Expected "," or "}"');
        }
      }
    }

    if (char === '[') {
      index++;
      const array: unknown[] = [];
      skipWhitespace();

      if (text[index] === ']') {
        index++;
        return array;
      }

      for (;;) {
        array.push(parseValue());
        skipWhitespace();
        const next = text[index++];

        if (next === ']') {
          return array;
        }

        if (next !== ',') {
          fail('Expected "," or "]"');
        }
      }
    }

    if (char === '"') {
      return parseString();
    }

    const literal = /^(?:true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/.exec(
      text.slice(index),
    );

    if (!literal) {
      return fail('Unexpected token');
    }

    index += literal[0].length;

    if (literal[0] === 'true') {
      return true;
    }

    if (literal[0] === 'false') {
      return false;
    }

    if (literal[0] === 'null') {
      return null;
    }

    return toNumber(literal[0]);
  };

  const value = parseValue();
  skipWhitespace();

  if (index !== text.length) {
    fail('Unexpected text after the value');
  }

  return value;
};

// JSON text with tagged big integers written back as plain integer literals,
// so a program reading its input sees the exact number.
export const stringifyJson = (value: unknown): string => {
  if (isBigInteger(value)) {
    return value.$int;
  }

  if (Array.isArray(value)) {
    return `[${value.map(stringifyJson).join(',')}]`;
  }

  if (value !== null && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => `${JSON.stringify(key)}:${stringifyJson(item)}`)
      .join(',')}}`;
  }

  if (typeof value === 'number' && !Number.isFinite(value)) {
    return 'null';
  }

  return JSON.stringify(value === undefined ? null : value);
};

// How a value reads to a learner: big integers without their tag
export const formatValue = (value: unknown): string => stringifyJson(value);
