import styled from 'styled-components';
import { mobile } from 'style/breakpoints';
import {
  Input as BaseInput,
  Textarea as BaseTextarea,
  Button as BaseButton,
  Label as BaseLabel,
} from 'style/elements';
import { ModalContent as BaseModalContent } from '../styles';

export const Wrapper = styled.div`
  width: 100%;
`;

export const ModalContent = styled(BaseModalContent)`
  padding: 40px 32px;
`;

export const Title = styled.h3`
  color: ${({ theme }) => theme.color.brand};
  line-height: 1;
  font-size: 1.5em;
  margin-bottom: 16px;
`;

export const EmailWrapper = styled.div`
  display: flex;
  align-items: center;
  line-height: 1;
  font-size: 18px;
`;

export const EmailText = styled.div`
  color: ${({ theme }) => theme.color.textSecondary};
  margin-right: 10px;
  font-weight: 400;
`;

export const EmailLink = styled.a`
  display: flex;
  align-items: center;

  svg {
    fill: ${({ theme }) => theme.color.brand};
    padding-top: 2px;
    margin-right: 4px;
  }
`;

const DIVIDER_PAD = 24;

export const Or = styled.div`
  color: ${({ theme }) => theme.color.textSecondary};
  width: 100%;
  position: relative;
  line-height: 1;
  font-weight: 300;
  font-size: 11px;
  margin-top: 16px;
  margin-bottom: 16px;

  &:before {
    background-color: ${({ theme }) => theme.color.border};
    content: ' ';
    position: absolute;
    left: 0;
    top: 50%;
    width: calc(50% - ${DIVIDER_PAD}px);
    height: 1px;
  }

  &:after {
    background-color: ${({ theme }) => theme.color.border};
    content: ' ';
    position: absolute;
    right: 0;
    top: 50%;
    width: calc(50% - ${DIVIDER_PAD}px);
    height: 1px;
  }
`;

export const FormContainer = styled.div`
  width: 100%;
  max-width: 100%;
  min-width: 440px;

  ${mobile()} {
    min-width: 100%;
  }
`;

export const FieldWrapper = styled.div`
  margin-bottom: 20px;
`;

export const Label = styled(BaseLabel)`
  display: block;
  text-align: left;
  padding-left: 4px;
`;

export const Input = styled(BaseInput)``;

export const Textarea = styled(BaseTextarea)``;

export const Button = styled(BaseButton)`
  width: 100%;
  padding: 1.2rem 2rem;
`;

export const ErrorText = styled.div`
  color: ${({ theme }) => theme.color.alert};
  text-align: left;
  margin-top: 4px;
`;

export const SlackWrapper = styled.div`
  font-size: 14px;
  margin-top: 8px;
`;

export const SlackLink = styled.a`
  text-decoration: underline;

  &:visited,
  &:focus,
  &:hover {
    text-decoration: underline;
  }
`;
