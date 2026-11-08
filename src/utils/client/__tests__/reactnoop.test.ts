import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { emptyComponent, upgradeCodeFunction } from 'utils/client/reactnoop';
import { CodingLanguage, codingLanguageList } from 'utils/constants/lesson';

/**
 * These two are the placeholders substituted for locked lesson content. If either ever
 * started returning the real snippet, paid content would leak into the editor for
 * viewers without access, so the assertions pin down "renders nothing but the upsell".
 *
 * They are rendered through React rather than inspected structurally: a hand-rolled
 * element walker can be wrong in the same direction as the code it is checking, and
 * what matters here is the markup that actually reaches the DOM.
 */

const render = (node: React.ReactNode) => renderToStaticMarkup(node as React.ReactElement);

const UPGRADE_TEXT = '// Upgrade for full course access';

describe('emptyComponent', () => {
  it('renders nothing', () => {
    expect(emptyComponent({} as any)).toBeNull();
    expect(render(React.createElement(emptyComponent))).toBe('');
  });

  it('swallows any children it is handed instead of rendering them', () => {
    // It is used as a drop-in replacement for real content components, so anything
    // passed through it must not reach the page.
    expect(
      render(React.createElement(emptyComponent, null, 'const answer = solve(input);')),
    ).toBe('');
  });
});

describe('upgradeCodeFunction', () => {
  it('renders only the upsell comment', () => {
    expect(render(upgradeCodeFunction(CodingLanguage.Javascript))).toBe(UPGRADE_TEXT);
  });

  it('returns the same placeholder for every supported language', () => {
    const rendered = codingLanguageList.map(language => render(upgradeCodeFunction(language)));

    expect(codingLanguageList.length).toBeGreaterThan(1);
    expect(rendered).toEqual(codingLanguageList.map(() => UPGRADE_TEXT));
  });

  it('emits no markup, so nothing can be styled or read out of the locked snippet', () => {
    const markup = render(upgradeCodeFunction(CodingLanguage.Python));

    // A bare text node: no elements, no attributes, no data-* payload carrying the
    // real solution alongside the placeholder.
    expect(markup).not.toMatch(/</);
    expect(markup.trim()).toBe(UPGRADE_TEXT);
  });
});
