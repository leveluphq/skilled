import * as React from 'react';
import styled from 'styled-components';

const TIME = 2000;

const Wrapper = styled.div`
  .lds-ripple {
    display: inline-block;
    position: relative;
    width: 80px;
    height: 80px;
  }
  .lds-ripple div {
    position: absolute;
    border: 4px solid ${({ theme }) => theme.color.brand};
    opacity: 1;
    border-radius: 50%;
    animation: lds-ripple ${TIME}ms cubic-bezier(0, 0.2, 0.8, 1) infinite;
  }
  .lds-ripple div:nth-child(2) {
    animation-delay: -${TIME / 2}ms;
  }
  @keyframes lds-ripple {
    0% {
      top: 36px;
      left: 36px;
      width: 0;
      height: 0;
      opacity: 1;
    }
    100% {
      top: 0px;
      left: 0px;
      width: 72px;
      height: 72px;
      opacity: 0;
    }
  }
`;

const Pulse = () => {
  return (
    <Wrapper>
      <div className="lds-ripple">
        <div></div>
        <div></div>
      </div>
    </Wrapper>
  );
};

export default Pulse;
