import styled from 'styled-components';
import { MarginContainer } from 'content/blocks/styles';
import { mobile } from 'style/breakpoints';

export const Container = styled(MarginContainer)`
  margin-bottom: 48px;
`;

export const Wrapper = styled.div`
  display: flex;

  ${mobile()} {
    flex-direction: column;
  }
`;

export const Column = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  &:first-of-type {
    padding-right: 24px;

    ${mobile()} {
      width: 100%;
      padding: 0;
      border: none;
      margin-bottom: 24px;
    }
  }

  &:last-of-type {
    padding-left: 24px;

    ${mobile()} {
      width: 100%;
      padding: 0;
      border: none;
      margin-top: 24px;
    }
  }
`;
