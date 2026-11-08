import { DesignSpec, FunctionSpec, LessonSpec, NeutralType, TypeNode } from './types';
import { isBigInteger } from './values';

const SCALARS = ['int', 'long', 'double', 'bool', 'string', 'char'] as const;

export class SpecTypeError extends Error {}

export const parseType = (type: NeutralType): TypeNode => {
  const text = type.replace(/\s+/g, '');

  if (text.endsWith('?')) {
    return { kind: 'nullable', of: parseType(text.slice(0, -1)) };
  }

  if (text.endsWith('[]')) {
    return { kind: 'array', of: parseType(text.slice(0, -2)) };
  }

  const map = /^map<string,(.+)>$/.exec(text);

  if (map) {
    return { kind: 'map', of: parseType(map[1]) };
  }

  if ((SCALARS as readonly string[]).includes(text)) {
    return { kind: 'scalar', name: text as (typeof SCALARS)[number] };
  }

  if (['ListNode', 'BinaryNode', 'BinaryNodeRef', 'Interval', 'Item', 'void'].includes(text)) {
    return { kind: text } as TypeNode;
  }

  throw new SpecTypeError(`Unknown type "${type}"`);
};

const INT32 = 2 ** 31;

// Why `value` doesn't fit `type`, or null when it does. `asInput` is true for
// arguments, which may use input-only encodings (a list with a cycle).
export const checkValue = (value: unknown, type: TypeNode, asInput: boolean): string | null => {
  switch (type.kind) {
    case 'nullable':
      // Outputs report an empty list or tree as [], in every language
      if (
        value === null &&
        !asInput &&
        (type.of.kind === 'ListNode' || type.of.kind === 'BinaryNode')
      ) {
        return 'an empty list or tree is expected as [], not null';
      }
      return value === null ? null : checkValue(value, type.of, asInput);
    case 'void':
      return value === null ? null : 'a void method returns null';
    case 'scalar':
      switch (type.name) {
        case 'int':
          return Number.isInteger(value) && (value as number) >= -INT32 && (value as number) < INT32
            ? null
            : 'expected a 32-bit integer';
        case 'long':
          if (isBigInteger(value)) {
            return /^-?\d+$/.test(value.$int) && BigIntLike.fitsInt64(value.$int)
              ? null
              : 'expected a 64-bit integer';
          }
          return Number.isSafeInteger(value)
            ? null
            : 'expected a 64-bit integer (write integers beyond 2^53 as { $int: "..." })';
        case 'double':
          return typeof value === 'number' && Number.isFinite(value)
            ? null
            : 'expected a finite number';
        case 'bool':
          return typeof value === 'boolean' ? null : 'expected true or false';
        case 'string':
          return typeof value === 'string' ? null : 'expected a string';
        case 'char':
          return typeof value === 'string' && value.length === 1
            ? null
            : 'expected a one-character string';
      }
      break;
    case 'array': {
      if (!Array.isArray(value)) {
        return 'expected a list';
      }
      for (let i = 0; i < value.length; i++) {
        const problem = checkValue(value[i], type.of, asInput);
        if (problem) {
          return `[${i}]: ${problem}`;
        }
      }
      return null;
    }
    case 'map': {
      if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        return 'expected an object';
      }
      for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
        const problem = checkValue(item, type.of, asInput);
        if (problem) {
          return `.${key}: ${problem}`;
        }
      }
      return null;
    }
    case 'ListNode': {
      if (asInput && value !== null && typeof value === 'object' && !Array.isArray(value)) {
        const { values, cycleIndex, ...rest } = value as { values?: unknown; cycleIndex?: unknown };
        if (Object.keys(rest).length) {
          return 'a list with a cycle is { values, cycleIndex }';
        }
        const problem = checkValue(values, parseType('int[]'), true);
        if (problem) {
          return `values: ${problem}`;
        }
        const length = (values as unknown[]).length;
        return cycleIndex === null ||
          (Number.isInteger(cycleIndex) &&
            (cycleIndex as number) >= 0 &&
            (cycleIndex as number) < length)
          ? null
          : 'cycleIndex must be null or the index of a node';
      }
      return checkValue(value, parseType('int[]'), asInput);
    }
    case 'BinaryNode': {
      const problem = checkValue(value, parseType('int?[]'), asInput);
      if (problem) {
        return problem;
      }
      const nodes = value as (number | null)[];
      if (nodes.length && nodes[0] === null) {
        return 'a tree in level order starts with its root, not null';
      }
      return !asInput && nodes.length && nodes[nodes.length - 1] === null
        ? 'trim trailing nulls from an expected tree'
        : null;
    }
    case 'BinaryNodeRef':
      return checkValue(value, parseType('int?'), asInput);
    case 'Interval': {
      if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        return 'expected { start, end }';
      }
      const { start, end, ...rest } = value as { start?: unknown; end?: unknown };
      return Object.keys(rest).length === 0 && typeof start === 'number' && typeof end === 'number'
        ? null
        : 'expected { start, end } with numbers';
    }
    case 'Item': {
      if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        return 'expected { weight, value }';
      }
      const { weight, value: worth, ...rest } = value as { weight?: unknown; value?: unknown };
      return Object.keys(rest).length === 0 &&
        checkValue(weight, { kind: 'scalar', name: 'int' }, asInput) === null &&
        checkValue(worth, { kind: 'scalar', name: 'int' }, asInput) === null
        ? null
        : 'expected { weight, value } with 32-bit integers';
    }
  }

  return 'unknown type';
};

// String arithmetic for the int64 range check, without needing BigInt
const BigIntLike = {
  fitsInt64(digits: string) {
    const negative = digits.startsWith('-');
    const magnitude = negative ? digits.slice(1) : digits;
    const limit = negative ? '9223372036854775808' : '9223372036854775807';
    return (
      magnitude.length < limit.length || (magnitude.length === limit.length && magnitude <= limit)
    );
  },
};

const checkFunctionSpec = (spec: FunctionSpec): string[] => {
  const problems: string[] = [];
  const params = spec.params.map((param) => parseType(param.type));
  const hidden = (spec.hidden || []).map((param) => parseType(param.type));
  const returns = parseType(spec.returns);

  if (!spec.tests.length) {
    problems.push('has no tests');
  }

  spec.tests.forEach((test, i) => {
    const where = `tests[${i}] "${test.description}"`;

    if (test.args.length !== params.length) {
      problems.push(
        `${where}: has ${test.args.length} args, but ${spec.entry} takes ${params.length}`,
      );
    } else {
      test.args.forEach((arg, j) => {
        const problem = checkValue(arg, params[j], true);
        if (problem) {
          problems.push(`${where}: argument ${spec.params[j].name}: ${problem}`);
        }
      });
    }

    if ((test.hidden || []).length !== hidden.length) {
      problems.push(`${where}: needs ${hidden.length} hidden values`);
    } else {
      (test.hidden || []).forEach((value, j) => {
        const problem = checkValue(value, hidden[j], true);
        if (problem) {
          problems.push(`${where}: hidden ${spec.hidden![j].name}: ${problem}`);
        }
      });
    }

    // A custom comparator decides what a valid answer looks like
    if (typeof spec.compare !== 'function') {
      const problem = checkValue(test.expected, returns, false);
      if (problem) {
        problems.push(`${where}: expected: ${problem}`);
      }
    }
  });

  if (spec.hidden && !spec.injected) {
    problems.push('hidden values need an injected function to use them');
  }

  return problems;
};

const checkDesignSpec = (spec: DesignSpec): string[] => {
  const problems: string[] = [];
  const methods = new Map(spec.methods.map((method) => [method.name, method]));

  spec.ctor.forEach((param) => parseType(param.type));

  if (!spec.tests.length) {
    problems.push('has no tests');
  }

  spec.tests.forEach((test, i) => {
    const where = `tests[${i}] "${test.description}"`;

    const ctorArgs = test.ctorArgs || [];

    if (ctorArgs.length !== spec.ctor.length) {
      problems.push(
        `${where}: passes ${ctorArgs.length} constructor args, but ${spec.className} takes ${spec.ctor.length}`,
      );
    } else {
      ctorArgs.forEach((arg, k) => {
        const problem = checkValue(arg, parseType(spec.ctor[k].type), true);
        if (problem) {
          problems.push(`${where}: constructor argument ${spec.ctor[k].name}: ${problem}`);
        }
      });
    }

    if (test.ops.length !== test.expected.length) {
      problems.push(
        `${where}: ${test.ops.length} operations but ${test.expected.length} expected values`,
      );
    }

    test.ops.forEach(([name, ...args], j) => {
      const method = methods.get(name);

      if (!method) {
        problems.push(`${where}: operation ${j} calls unknown method ${name}`);
        return;
      }

      if (args.length !== method.params.length) {
        problems.push(
          `${where}: operation ${j} passes ${args.length} args to ${name}, which takes ${method.params.length}`,
        );
        return;
      }

      args.forEach((arg, k) => {
        const problem = checkValue(arg, parseType(method.params[k].type), true);
        if (problem) {
          problems.push(`${where}: operation ${j} ${name} argument ${k}: ${problem}`);
        }
      });

      if (typeof spec.compare !== 'function' && j < test.expected.length) {
        const problem = checkValue(test.expected[j], parseType(method.returns), false);
        if (problem) {
          problems.push(`${where}: expected[${j}] (${name}): ${problem}`);
        }
      }
    });
  });

  return problems;
};

// Everything wrong with a spec, as readable messages. Empty when it's valid.
export const validateSpec = (spec: LessonSpec): string[] => {
  try {
    return spec.kind === 'function' ? checkFunctionSpec(spec) : checkDesignSpec(spec);
  } catch (error) {
    return [error instanceof Error ? error.message : String(error)];
  }
};

// Specs are plain objects; this gives them a type and one place to change later
export const defineSpec = <T extends LessonSpec>(spec: T): T => spec;
