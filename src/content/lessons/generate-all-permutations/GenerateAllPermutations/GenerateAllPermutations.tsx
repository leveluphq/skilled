import * as React from 'react';
// @ts-ignore
import {
  PlayFilledAlt16,
  PauseFilled16,
  SkipForwardFilled16,
  SkipBackFilled16,
} from '@carbon/icons-react';

import {
  Wrapper,
  Form,
  Button,
  ControlWrapper,
  ControlButton,
  Input,
  PermList,
  Character,
} from './styles';

enum StackAction {
  Push = 'push',
  Pop = 'pop',
  PopPush = 'poppush',
}

interface PermutationStack {
  action: StackAction;
  value?: string;
  lettersAdded?: number;
}

interface PermutationResult {
  perms: string[];
  stack: PermutationStack[];
}

const INIT_PROGRESS = {
  stackDepth: 0,
  charactersVisited: 0,
  visibleStack: [] as string[],
  viewedStack: [] as string[][],
};

const generateCharacterPriority = (str: string) => {
  let count = 0;

  const generatePermutations = (num: number): number[][] => {
    if (num < 2) {
      count++;
      return [[count]];
    }

    const permutationsArray: number[][] = [];

    for (let i = 0; i < num; i++) {
      const remainingPermutations = generatePermutations(num - 1);

      for (let permutation of remainingPermutations) {
        count++;
        permutation.unshift(count);
        permutationsArray.push(permutation);
      }
    }

    return permutationsArray;
  };

  return generatePermutations(str.length);
};

const visualizePermutations = (string: string): PermutationResult => {
  if (string.length < 2) {
    return {
      perms: [string],
      stack: [
        { action: StackAction.Push, value: `['${string}'] // base case`, lettersAdded: 1 },
        { action: StackAction.Pop },
      ],
    };
  }

  const permutationsArray = [];
  let stack: PermutationStack[] = [];

  for (let i = 0; i < string.length; i++) {
    const frontCharacter = string[i];
    const remainingChars = string.slice(0, i) + string.slice(i + 1, string.length);

    stack.push({
      action: StackAction.Push,
      value: `'${frontCharacter}' + permutations('${remainingChars}')`,
    });

    const remainingPermutations = visualizePermutations(remainingChars);

    stack = [...stack, ...remainingPermutations.stack];

    for (let permutation of remainingPermutations.perms) {
      permutationsArray.push(frontCharacter + permutation);
    }

    stack.push({
      action: StackAction.PopPush,
      value: `'${frontCharacter}' + permutations('${remainingChars}') // [${remainingPermutations.perms
        .map((item) => `'${frontCharacter}' + '${item}'`)
        .join(', ')}]`,
      lettersAdded: remainingPermutations.perms.length,
    });

    stack.push({ action: StackAction.Pop });
  }

  return { perms: permutationsArray, stack };
};

const moveForward = (progress: any, callstack: any, setProgress: any) => {
  const { stackDepth, charactersVisited, visibleStack, viewedStack } = progress;

  const stackItem = callstack[stackDepth];
  const updatedStack = [...visibleStack];

  if (stackItem.action === StackAction.Pop) {
    updatedStack.pop();
  } else if (stackItem.action === StackAction.Push) {
    updatedStack.push(stackItem.value!);
  } else if (stackItem.action === StackAction.PopPush) {
    updatedStack.pop();
    updatedStack.push(stackItem.value!);
  }

  setProgress({
    charactersVisited: charactersVisited + (stackItem.lettersAdded || 0),
    stackDepth: stackDepth + 1,
    visibleStack: updatedStack,
    viewedStack: [...viewedStack, visibleStack],
  });
};

const moveBackward = (progress: any, callstack: any, setProgress: any) => {
  const { stackDepth, charactersVisited, viewedStack } = progress;

  const stackItem = callstack[stackDepth - 1];
  const cleanViewedStack = [...viewedStack];
  const updatedStack = cleanViewedStack.pop();

  setProgress({
    charactersVisited: charactersVisited - (stackItem.lettersAdded || 0),
    stackDepth: stackDepth - 1,
    visibleStack: updatedStack,
    viewedStack: cleanViewedStack,
  });
};

const GenerateAllPermutations = () => {
  const [isRunning, setIsRunning] = React.useState(false);
  const [word, setWord] = React.useState('dev');
  const [characterPriority, setCharacterPriority] = React.useState<number[][]>([[]]);
  const [permutations, setPermutations] = React.useState<string[]>([]);
  const [callstack, setCallstack] = React.useState<PermutationStack[]>([]);
  const [progress, setProgress] = React.useState(INIT_PROGRESS);
  const index = Math.floor((progress.stackDepth / callstack.length) * word.length);
  const frontCharacter = word[index];
  const remainingChars = word.slice(0, index) + word.slice(index + 1, word.length);
  const displayStack = Array(word.length)
    .fill('')
    .map((_, i) => progress.visibleStack[i] || ' ');
  const permutationLevels = React.useMemo(() => {
    const levels: string[][] = [];

    for (let i = 0; i < permutations.length; i++) {
      if (i % (permutations.length / word.length) === 0) {
        levels.push([]);
      }

      levels[levels.length - 1].push(permutations[i]);
    }

    return levels;
  }, [permutations]);

  React.useEffect(() => {
    if (!isRunning) {
      return;
    }

    let timeout = setTimeout(() => {
      const { stackDepth } = progress;
      if (isRunning && stackDepth < callstack.length) {
        moveForward(progress, callstack, setProgress);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [isRunning, callstack, progress]);

  return (
    <Wrapper>
      <div>
        <strong>Interactive Permutation Animation</strong>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const { perms, stack } = visualizePermutations(word);
          setProgress(INIT_PROGRESS);
          setPermutations(perms);
          setCallstack(stack);
          setCharacterPriority(generateCharacterPriority(word));
          setIsRunning(true);
        }}
      >
        <Form>
          <Input
            placeholder="Enter any word up to 5 characters"
            value={word}
            onChange={(e) => {
              setIsRunning(false);
              setPermutations([]);
              setProgress(INIT_PROGRESS);
              setWord(e.target.value);
            }}
            maxLength={5}
          />
          <Button type="submit" hoverable solid>
            Generate Permutations
          </Button>
        </Form>
      </form>
      {permutations.length > 0 && (
        <ControlWrapper>
          <ControlButton
            onClick={() => {
              setIsRunning(false);
              if (progress.stackDepth > 0) {
                moveBackward(progress, callstack, setProgress);
              }
            }}
          >
            <SkipBackFilled16 />
          </ControlButton>
          {isRunning ? (
            <ControlButton onClick={() => setIsRunning(false)}>
              <PauseFilled16 />
            </ControlButton>
          ) : (
            <ControlButton onClick={() => setIsRunning(true)}>
              <PlayFilledAlt16 />
            </ControlButton>
          )}
          <ControlButton
            onClick={() => {
              setIsRunning(false);
              if (progress.stackDepth < callstack.length) {
                moveForward(progress, callstack, setProgress);
              }
            }}
          >
            <SkipForwardFilled16 />
          </ControlButton>
        </ControlWrapper>
      )}
      {permutations.length > 0 && (
        <pre className="language-javascript" style={{ marginTop: '4px' }}>
          <div style={{ fontWeight: 'bold' }}>
            permutations({word}) // {frontCharacter} {remainingChars}
          </div>
          <code className="language-javascript">
            {displayStack.map((item, i) => (
              <div key={`${item}:${i}`} style={{ paddingLeft: `${i * 16}px`, paddingTop: '4px' }}>
                {item}
              </div>
            ))}
          </code>
        </pre>
      )}
      <PermList>
        {permutationLevels.map((level, colIndex) => {
          return (
            <div key={colIndex} style={{ width: `${100 / (word.length || 1)}%` }}>
              {level.map((perm, rowIndex) => {
                return (
                  <div key={`${colIndex}:${rowIndex}`}>
                    {perm.split('').map((char, i) => (
                      <Character
                        key={`${perm}:${char}:${i}`}
                        isVisited={
                          (characterPriority[
                            (colIndex * permutations.length) / word.length + rowIndex
                          ] || [])[i] <= progress.charactersVisited
                        }
                      >
                        {char}
                      </Character>
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
      </PermList>
    </Wrapper>
  );
};

export default GenerateAllPermutations;
