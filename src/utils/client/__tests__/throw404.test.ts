import * as React from 'react';
import NextError from 'next/error';
import throw404, { NOT_FOUND_MESSAGE, NOT_FOUND_STATUS } from 'utils/client/throw404';

/**
 * `throw404` has to behave differently on each side of the render boundary:
 * on the server it must THROW so Next serves a real 404 status, and in the browser it
 * must RETURN an element so client-side navigation swaps in the error page instead of
 * blowing up the React tree. Returning instead of throwing on the server would ship a
 * 200 response for a missing page, which is both an SEO and a correctness bug.
 */

const originalBrowser = (process as any).browser;

afterEach(() => {
  (process as any).browser = originalBrowser;
});

describe('throw404', () => {
  it('throws an ENOENT-coded error on the server', () => {
    (process as any).browser = false;

    expect(() => throw404()).toThrow('Not found');

    try {
      throw404();
      throw new Error('throw404 returned instead of throwing');
    } catch (error) {
      // `withApollo` matches on the literal code, so pin the value rather than
      // comparing the export against itself.
      expect((error as any).code).toBe('ENOENT');
      expect(NOT_FOUND_MESSAGE).toBe('ENOENT');
      expect(error).toBeInstanceOf(Error);
    }
  });

  it('throws when process.browser is undefined rather than falling through', () => {
    delete (process as any).browser;

    expect(() => throw404()).toThrow('Not found');
  });

  it('returns a 404 error element in the browser without throwing', () => {
    (process as any).browser = true;

    const element = throw404() as React.ReactElement;

    expect(React.isValidElement(element)).toBe(true);
    expect(element.type).toBe(NextError);
    // The literal, not `NOT_FOUND_STATUS`: the source renders that same constant, so
    // comparing against it would pass for any value the constant happened to hold.
    expect((element.props as any).statusCode).toBe(404);
    expect(NOT_FOUND_STATUS).toBe(404);
  });
});
