import * as React from 'react';
import styled from 'styled-components';
import { Buttons } from '../styles';

export const StateCards = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 20px 0;
  > div {
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: 6px;
    padding: 12px;
    min-width: 65px;
    line-height: 1.7;
    text-align: center;
  }
  small {
    display: block;
  }
`;

export default function TracePlayer({
  count,
  index,
  setIndex,
  children,
}: {
  count: number;
  index: number;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
  children: React.ReactNode;
}) {
  return (
    <>
      <Buttons>
        <button disabled={index === 0} onClick={() => setIndex(0)}>
          Reset steps
        </button>
        <button disabled={index === 0} onClick={() => setIndex((value) => Math.max(0, value - 1))}>
          Previous step
        </button>
        <button
          disabled={index + 1 >= count}
          onClick={() => setIndex((value) => Math.min(count - 1, value + 1))}
        >
          Next step
        </button>
        <button disabled={index + 1 >= count} onClick={() => setIndex(count - 1)}>
          Show result
        </button>
      </Buttons>
      <p>
        Step {index + 1} of {count}
      </p>
      <div aria-live="polite" aria-atomic="true">
        {children}
      </div>
    </>
  );
}
