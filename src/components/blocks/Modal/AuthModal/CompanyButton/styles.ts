import styled from 'styled-components';
import { CompanyButtonProps } from './props';

const CompanyButtonBase = styled.a`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border: none;
  margin: 0;
  text-decoration: none;
  background: none;
  color: white;
  transition: background-color 250ms ease-in-out;
  width: 100%;
  height: 52px;
  position: relative;
  font-weight: 600;
  border-radius: 2px;

  &:focus {
    outline-color: ${({ theme }) => theme.color.buttonOutline};
  }
`;

export const CompanyButtonWrapper = styled(CompanyButtonBase)<CompanyButtonProps>`
  width: 100%;
  line-height: 20px;
  background-color: ${({ theme, company }) => theme.company.color[company]};

  &:hover {
    background-color: ${({ theme, company }) => theme.company.hover[company]};
  }
`;

export const CompanyIcon = styled.div`
  position: absolute;
  left: 20px;
  height: 100%;
  display: flex;
  align-items: center;
`;
