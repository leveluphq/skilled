import { CodingLanguage } from 'utils/constants/lesson';

// The language-neutral description of a lesson's tests. One spec per lesson
// drives every language: each language's runtime turns it into a program, and
// the server compares the outputs against the expected values here.

// Neutral types, written as strings:
//   int (32-bit), long (64-bit), double, bool, string, char (a 1-character string)
//   T[]  and T[][] of any of those
//   map<string,T>
//   T?   (may be null)
//   ListNode       a singly linked list, given and returned as int[]. An empty
//                  (null) list is always returned as [], in every language.
//                  An input may also be {"values": int[], "cycleIndex": n} to
//                  link the tail back to node n.
//   BinaryNode     a binary tree, given and returned in level order as (int|null)[];
//                  an empty tree is returned as []
//   BinaryNodeRef  a node of an input tree, returned by the user and reported
//                  as its `data` (null when the user returns null)
//   Interval       {start: double, end: double}
//   Item           {weight: int, value: int} (knapsack). Like Interval, a class
//                  with those fields in typed languages, an object in
//                  JavaScript and a dict in Python
//   void           (design methods only)
export type NeutralType = string;

export interface Param {
  name: string;
  type: NeutralType;
}

// How the actual output is checked against the expected one:
//   exact            deep equality; integers compared exactly, -0 equals 0
//   { float: eps }   numbers may differ by up to eps
//   unorderedList    same elements in any order
//   unorderedNested  a list of lists, with neither level ordered
//   unorderedPairs   a list of pairs, with neither the pairs nor the two
//                    elements of a pair ordered
//   a function       any valid answer; return true to pass
export type Comparator =
  | 'exact'
  | { float: number }
  | 'unorderedList'
  | 'unorderedNested'
  | 'unorderedPairs'
  | ((actual: unknown, expected: unknown, args: unknown[]) => boolean);

// A helper function the user's code calls, whose behaviour depends on hidden
// per-test state (first-bad-version's isBadVersion). Each language supplies
// its own one-line body.
export interface InjectedFunction {
  name: string;
  params: Param[];
  returns: NeutralType;
  body: Partial<Record<CodingLanguage, string>>;
  // In Java, C#, Kotlin and Swift, the class the learner's Solution extends to
  // get the function, as on LeetCode (VersionControl for isBadVersion)
  baseClass: string;
}

export interface FunctionTest {
  description: string;
  args: unknown[];
  // Values for the spec's `hidden` parameters, in order
  hidden?: unknown[];
  expected: unknown;
}

// A name in a language where the derived casing is wrong for the lesson
export type NameOverrides = Partial<Record<CodingLanguage, string>>;

export interface FunctionSpec {
  kind: 'function';
  // camelCase; each language derives its own casing (count_islands in Python)
  entry: string;
  names?: NameOverrides;
  params: Param[];
  returns: NeutralType;
  compare?: Comparator;
  hidden?: Param[];
  injected?: InjectedFunction;
  // Tests that can hang on a common bug go last (see the runner plan §4)
  tests: FunctionTest[];
  limits?: { cpuTimeLimit?: number };
}

export interface Method {
  name: string;
  names?: NameOverrides;
  params: Param[];
  returns: NeutralType;
}

// A class the user writes, driven by a list of [method, ...args] calls
export type Operation = [string, ...unknown[]];

export interface DesignTest {
  description: string;
  // Arguments for the constructor, in the order of the spec's `ctor`
  ctorArgs?: unknown[];
  ops: Operation[];
  // One value per operation (null for void methods)
  expected: unknown[];
}

export interface DesignSpec {
  kind: 'design';
  className: string;
  ctor: Param[];
  methods: Method[];
  compare?: Comparator;
  tests: DesignTest[];
  limits?: { cpuTimeLimit?: number };
}

export type LessonSpec = FunctionSpec | DesignSpec;

// Parsed form of a NeutralType
export type TypeNode =
  | { kind: 'scalar'; name: 'int' | 'long' | 'double' | 'bool' | 'string' | 'char' }
  | { kind: 'array'; of: TypeNode }
  | { kind: 'map'; of: TypeNode }
  | { kind: 'nullable'; of: TypeNode }
  | { kind: 'ListNode' }
  | { kind: 'BinaryNode' }
  | { kind: 'BinaryNodeRef' }
  | { kind: 'Interval' }
  | { kind: 'Item' }
  | { kind: 'void' };
