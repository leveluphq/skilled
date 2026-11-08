import * as React from 'react';
import styled from 'styled-components';
import overviews from 'content/resources/lesson-overviews.json';

const Wrapper = styled.section`
  padding: 24px;
  margin: 20px 0;
  border-top: 1px solid ${({ theme }) => theme.color.border};
  h2 {
    font-size: 18px;
    margin-bottom: 12px;
  }
  h3 {
    font-size: 16px;
    line-height: 1.6;
    margin: 18px 0 10px;
  }
  p,
  li {
    font-size: 14px;
    line-height: 1.8;
    margin: 10px 0;
  }
  summary {
    cursor: pointer;
    line-height: 1.8;
    min-height: 44px;
    padding: 10px 0;
  }
  ul {
    padding-left: 20px;
  }
`;

export default function LessonOverview({ slug }: { slug: string }) {
  const overview = overviews[slug as keyof typeof overviews];
  if (!overview) return null;
  return (
    <Wrapper aria-label="Approach and test strategy">
      <h2>Approach and test strategy</h2>
      <p>{overview.focus}</p>
      <details>
        <summary>Read the approach, boundary cases, and complexity</summary>
        <p>{overview.approach}</p>
        <h3>Cases to check</h3>
        <ul>
          {overview.checks.map((check) => (
            <li key={check}>{check}</li>
          ))}
        </ul>
        <h3>Cost model</h3>
        <p>{overview.cost}</p>
      </details>
    </Wrapper>
  );
}
