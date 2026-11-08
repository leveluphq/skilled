import * as React from 'react';
import { render, screen } from '@testing-library/react';
import ViewerContext from '../index';

const Consumer: React.FC = () => {
  const viewerToken = React.useContext(ViewerContext);

  return (
    <div>
      <span data-testid="token">{viewerToken}</span>
      <span data-testid="is-signed-in">{viewerToken ? 'yes' : 'no'}</span>
    </div>
  );
};

describe('ViewerContext', () => {
  // Pages and hooks branch on `if (viewerToken)` to decide whether to run viewer
  // queries and whether to show paid state. A non-empty (truthy) default would make
  // every anonymous visitor look signed in on first paint, and would make
  // useStaticViewerToken issue viewer queries with a junk id.
  // NOTE: the rest of this context is a single `React.createContext('')` call -
  // asserting that a Provider propagates its value, or that the index barrel
  // re-exports the same object, only exercises React and the module system, so
  // those cases are deliberately not tested here.
  it('defaults to an empty string so a consumer with no provider reads as signed out', () => {
    render(<Consumer />);

    expect(screen.getByTestId('token')).toBeEmptyDOMElement();
    expect(screen.getByTestId('is-signed-in')).toHaveTextContent('no');
  });
});
