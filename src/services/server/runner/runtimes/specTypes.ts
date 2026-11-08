import { parseType } from 'utils/shared/runner/spec';
import { LessonSpec, TypeNode } from 'utils/shared/runner/types';

// The runner-provided types a spec uses, so a language only adds the classes
// a lesson needs. A learner's own ListNode stays legal in lessons without one.
export type RunnerType = 'ListNode' | 'BinaryNode' | 'Interval' | 'Item';

const collect = (node: TypeNode, found: Set<RunnerType>) => {
  switch (node.kind) {
    case 'array':
    case 'map':
    case 'nullable':
      collect(node.of, found);
      break;
    case 'ListNode':
    case 'BinaryNode':
    case 'Interval':
    case 'Item':
      found.add(node.kind);
      break;
    case 'BinaryNodeRef':
      found.add('BinaryNode');
      break;
    default:
  }
};

// Every type in a spec's signatures
export const specTypeStrings = (spec: LessonSpec): string[] =>
  spec.kind === 'function'
    ? [
        ...spec.params.map((param) => param.type),
        spec.returns,
        ...(spec.hidden || []).map((param) => param.type),
        ...(spec.injected
          ? [...spec.injected.params.map((param) => param.type), spec.injected.returns]
          : []),
      ]
    : [
        ...spec.ctor.map((param) => param.type),
        ...spec.methods.flatMap((method) => [
          ...method.params.map((param) => param.type),
          method.returns,
        ]),
      ];

export const runnerTypesIn = (spec: LessonSpec): Set<RunnerType> => {
  const found = new Set<RunnerType>();
  specTypeStrings(spec).forEach((type) => collect(parseType(type), found));
  return found;
};

// In a fixed order, so the assembled program is stable
export const RUNNER_TYPES: RunnerType[] = ['ListNode', 'BinaryNode', 'Interval', 'Item'];
