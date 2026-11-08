import styled from 'styled-components';

const DIMENSION = 48;

export const Wrapper = styled.div``;

export const Header = styled.div`
  text-align: center;
  font-weight: 600;
  margin-bottom: 6px;
`;

export const Board = styled.div`
  display: flex;
  justify-content: center;
`;

export const PieceWrapper = styled.div`
  width: ${DIMENSION}px;
  height: ${DIMENSION}px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Piece = styled.div`
  width: ${DIMENSION / 2}px;
  height: ${DIMENSION / 2}px;
  background-color: ${({ theme }) => theme.color.textPrimary};
  border-radius: 50%;
`;

export const Square = styled.div`
  width: ${DIMENSION}px;
  height: ${DIMENSION}px;
  border: 1px solid ${({ theme }) => theme.color.textPrimary};
`;

export const Index = styled.div`
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  margin-top: 4px;
`;
