import { Comparator } from './types';
import { isBigInteger } from './values';

// A string that's equal for two values exactly when they're the same JSON
// value: integers by their digits (so 64-bit values compare exactly), -0 as 0,
// and object keys in sorted order.
export const canonical = (value: unknown): string => {
  if (isBigInteger(value)) {
    return value.$int;
  }

  if (typeof value === 'number') {
    if (Object.is(value, -0)) {
      return '0';
    }
    return Number.isFinite(value) ? JSON.stringify(value) : 'null';
  }

  if (Array.isArray(value)) {
    return `[${value.map(canonical).join(',')}]`;
  }

  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
      a < b ? -1 : a > b ? 1 : 0,
    );
    return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(',')}}`;
  }

  return JSON.stringify(value === undefined ? null : value);
};

const sortedCanonical = (values: unknown[]) => values.map(canonical).sort();

const sameMultiset = (actual: unknown, expected: unknown) =>
  Array.isArray(actual) &&
  Array.isArray(expected) &&
  canonical(sortedCanonical(actual)) === canonical(sortedCanonical(expected));

const withinTolerance = (actual: unknown, expected: unknown, eps: number): boolean => {
  if (typeof actual === 'number' && typeof expected === 'number') {
    return Math.abs(actual - expected) <= eps;
  }

  if (Array.isArray(actual) && Array.isArray(expected)) {
    return (
      actual.length === expected.length &&
      actual.every((item, i) => withinTolerance(item, expected[i], eps))
    );
  }

  if (
    actual !== null &&
    expected !== null &&
    typeof actual === 'object' &&
    typeof expected === 'object' &&
    !Array.isArray(actual) &&
    !Array.isArray(expected) &&
    !isBigInteger(actual) &&
    !isBigInteger(expected)
  ) {
    const actualKeys = Object.keys(actual as object).sort();
    const expectedKeys = Object.keys(expected as object).sort();
    return (
      canonical(actualKeys) === canonical(expectedKeys) &&
      expectedKeys.every((key) =>
        withinTolerance(
          (actual as Record<string, unknown>)[key],
          (expected as Record<string, unknown>)[key],
          eps,
        ),
      )
    );
  }

  return canonical(actual) === canonical(expected);
};

// Whether the actual output passes. `args` are the test's arguments, for
// comparators that check "any valid answer".
export const compareOutput = (
  comparator: Comparator | undefined,
  actual: unknown,
  expected: unknown,
  args: unknown[],
): boolean => {
  if (typeof comparator === 'function') {
    try {
      return comparator(actual, expected, args) === true;
    } catch (error) {
      return false;
    }
  }

  if (comparator === undefined || comparator === 'exact') {
    return canonical(actual) === canonical(expected);
  }

  if (typeof comparator === 'object') {
    return withinTolerance(actual, expected, comparator.float);
  }

  switch (comparator) {
    case 'unorderedList':
      return sameMultiset(actual, expected);
    case 'unorderedNested':
      return (
        Array.isArray(actual) &&
        Array.isArray(expected) &&
        actual.every(Array.isArray) &&
        sameMultiset(
          actual.map((group) => sortedCanonical(group as unknown[])),
          (expected as unknown[][]).map((group) => sortedCanonical(group)),
        )
      );
    case 'unorderedPairs':
      return (
        Array.isArray(actual) &&
        Array.isArray(expected) &&
        actual.every((pair) => Array.isArray(pair) && pair.length === 2) &&
        sameMultiset(
          actual.map((pair) => sortedCanonical(pair as unknown[])),
          (expected as unknown[][]).map((pair) => sortedCanonical(pair)),
        )
      );
  }

  return false;
};
