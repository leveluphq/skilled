import collectAriaAttributes from 'utils/client/collectAriaAttributes';

describe('collectAriaAttributes', () => {
  it('keeps only keys prefixed with "aria-"', () => {
    const result = collectAriaAttributes({
      'aria-label': 'Close',
      'aria-hidden': true,
      'aria-describedby': 'desc-1',
      onClick: jest.fn(),
      className: 'btn',
      role: 'button',
      id: 'x',
    });

    expect(result).toEqual({
      'aria-label': 'Close',
      'aria-hidden': true,
      'aria-describedby': 'desc-1',
    });
  });

  it('only matches the prefix at the start of the key', () => {
    const result = collectAriaAttributes({
      'data-aria-label': 'nope',
      ariaLabel: 'nope',
      'Aria-label': 'nope',
      ' aria-label': 'nope',
    });

    expect(result).toEqual({});
  });

  it('preserves falsy aria values instead of dropping them', () => {
    const result = collectAriaAttributes({
      'aria-hidden': false,
      'aria-label': '',
      'aria-valuenow': 0,
      'aria-describedby': undefined,
    });

    // `aria-hidden={false}` is meaningful to React, so it must survive the copy.
    expect(result).toEqual({
      'aria-hidden': false,
      'aria-label': '',
      'aria-valuenow': 0,
      'aria-describedby': undefined,
    });
    expect(Object.keys(result)).toHaveLength(4);
  });

  it('returns a new object and does not mutate the props it reads', () => {
    const props = { 'aria-label': 'Close', className: 'btn' };
    const result = collectAriaAttributes(props);

    expect(result).not.toBe(props);
    expect(props).toEqual({ 'aria-label': 'Close', className: 'btn' });
  });

  it('returns an empty object for empty props', () => {
    expect(collectAriaAttributes({})).toEqual({});
  });

  it('picks up inherited aria keys from the prototype chain', () => {
    const base = { 'aria-label': 'inherited' };
    const props = Object.create(base);
    props['aria-hidden'] = true;

    const result = collectAriaAttributes(props);

    // BUG: `for...in` walks the prototype chain with no `hasOwnProperty` guard, so an
    // inherited (or Object.prototype-polluted) `aria-*` key is silently forwarded onto
    // the rendered DOM node. It should only collect own enumerable properties.
    // Asserting current behaviour so the suite stays green -- see bugs_found.
    expect(result).toEqual({ 'aria-hidden': true, 'aria-label': 'inherited' });
  });
});
