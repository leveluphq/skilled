/**
 * @jest-environment jsdom
 */
import { FREEZE_CLASS, SMOOTH_SCROLL_CLASS } from 'style/GlobalStyle';
import {
  KeyCodes,
  isLastChild,
  hasChildren,
  freezeBody,
  unfreezeBody,
  smoothScrollLinks,
  unSmoothScrollLinks,
  isScrolledToBottom,
} from 'utils/client/dom';

const setViewport = ({
  innerHeight,
  pageYOffset,
  bodyHeight,
}: {
  innerHeight: number;
  pageYOffset: number;
  bodyHeight: number;
}) => {
  Object.defineProperty(window, 'innerHeight', { value: innerHeight, configurable: true });
  Object.defineProperty(window, 'pageYOffset', { value: pageYOffset, configurable: true });
  Object.defineProperty(document.body, 'offsetHeight', {
    value: bodyHeight,
    configurable: true,
  });
};

beforeEach(() => {
  document.body.className = '';
  document.documentElement.className = '';
  document.body.innerHTML = '';
});

describe('KeyCodes', () => {
  it('maps to the legacy keyCode numbers the handlers compare against', () => {
    expect(KeyCodes.Backspace).toBe(8);
    expect(KeyCodes.Enter).toBe(13);
    expect(KeyCodes.Esc).toBe(27);
  });
});

describe('isLastChild', () => {
  it('is true only for the final sibling', () => {
    document.body.innerHTML = '<div id="a"></div><div id="b"></div>';
    const [a, b] = Array.from(document.body.children) as HTMLDivElement[];

    expect(isLastChild(a)).toBe(false);
    expect(isLastChild(b)).toBe(true);
  });

  it('ignores trailing text nodes, which are not elements', () => {
    document.body.innerHTML = '<div id="a"></div>trailing text';
    const a = document.getElementById('a') as HTMLDivElement;

    expect(isLastChild(a)).toBe(true);
  });
});

describe('hasChildren', () => {
  it('is false for null and for an empty element', () => {
    expect(hasChildren(null)).toBe(false);
    expect(hasChildren(document.createElement('div'))).toBe(false);
  });

  it('counts text nodes as children, not just elements', () => {
    const el = document.createElement('div');
    el.textContent = 'hello';

    expect(hasChildren(el)).toBe(true);
  });

  it('is true for an element with an element child', () => {
    const el = document.createElement('div');
    el.appendChild(document.createElement('span'));

    expect(hasChildren(el)).toBe(true);
  });
});

describe('freezeBody / unfreezeBody', () => {
  it('adds and removes the scroll-lock class defined by the global stylesheet', () => {
    freezeBody();
    expect(document.body.classList.contains(FREEZE_CLASS)).toBe(true);

    unfreezeBody();
    expect(document.body.classList.contains(FREEZE_CLASS)).toBe(false);
  });

  it('is idempotent so nested modals do not leave a duplicate class behind', () => {
    freezeBody();
    freezeBody();
    unfreezeBody();

    // BUG-adjacent: there is no reference count, so the second modal closing unfreezes
    // the page while the first is still open. Documented here as current behaviour.
    expect(document.body.classList.contains(FREEZE_CLASS)).toBe(false);
    expect(document.body.className.split(' ').filter(Boolean)).toEqual([]);
  });

  it('leaves unrelated classes on the body alone', () => {
    document.body.className = 'theme-dark';

    freezeBody();
    unfreezeBody();

    expect(document.body.className).toBe('theme-dark');
  });

  it('does not throw when unfreezing a body that was never frozen', () => {
    expect(() => unfreezeBody()).not.toThrow();
    expect(document.body.classList.contains(FREEZE_CLASS)).toBe(false);
  });
});

describe('smoothScrollLinks / unSmoothScrollLinks', () => {
  it('toggles the class on both body and documentElement', () => {
    smoothScrollLinks();

    // `scroll-behavior` is only honoured on the scrolling element, which differs by
    // browser, so both nodes must be toggled.
    expect(document.body.classList.contains(SMOOTH_SCROLL_CLASS)).toBe(true);
    expect(document.documentElement.classList.contains(SMOOTH_SCROLL_CLASS)).toBe(true);

    unSmoothScrollLinks();

    expect(document.body.classList.contains(SMOOTH_SCROLL_CLASS)).toBe(false);
    expect(document.documentElement.classList.contains(SMOOTH_SCROLL_CLASS)).toBe(false);
  });

  it('does not disturb the scroll lock, which is toggled independently', () => {
    // `useSmoothScrollLinks` unmounts (and calls `unSmoothScrollLinks`) on route changes
    // while a modal may still hold the body frozen. If either helper reached for the
    // wrong constant the page would silently start scrolling behind an open modal.
    freezeBody();
    smoothScrollLinks();

    expect(document.body.classList.contains(FREEZE_CLASS)).toBe(true);

    unSmoothScrollLinks();

    expect(document.body.classList.contains(FREEZE_CLASS)).toBe(true);
    expect(document.body.classList.contains(SMOOTH_SCROLL_CLASS)).toBe(false);

    unfreezeBody();

    expect(document.body.classList.contains(FREEZE_CLASS)).toBe(false);
  });

  it('leaves the smooth-scroll class alone when the body is unfrozen', () => {
    smoothScrollLinks();
    freezeBody();
    unfreezeBody();

    expect(document.body.classList.contains(SMOOTH_SCROLL_CLASS)).toBe(true);
    expect(document.documentElement.classList.contains(SMOOTH_SCROLL_CLASS)).toBe(true);
  });
});

describe('isScrolledToBottom', () => {
  it('is false part-way down a long page', () => {
    setViewport({ innerHeight: 500, pageYOffset: 0, bodyHeight: 2000 });

    expect(isScrolledToBottom()).toBe(false);
  });

  it('flips to true exactly one pixel early because of the +1 fudge factor', () => {
    // innerHeight + pageYOffset + 1 >= bodyHeight
    setViewport({ innerHeight: 500, pageYOffset: 1498, bodyHeight: 2000 });
    expect(isScrolledToBottom()).toBe(false);

    setViewport({ innerHeight: 500, pageYOffset: 1499, bodyHeight: 2000 });
    expect(isScrolledToBottom()).toBe(true);
  });

  it('is true when scrolled past the bottom (rubber-band / overscroll)', () => {
    setViewport({ innerHeight: 500, pageYOffset: 1600, bodyHeight: 2000 });

    expect(isScrolledToBottom()).toBe(true);
  });

  it('is true for a page shorter than the viewport', () => {
    setViewport({ innerHeight: 900, pageYOffset: 0, bodyHeight: 300 });

    expect(isScrolledToBottom()).toBe(true);
  });

  it('is true when the body has not been laid out yet', () => {
    setViewport({ innerHeight: 768, pageYOffset: 0, bodyHeight: 0 });

    // An offsetHeight of 0 (pre-layout) reads as "bottom reached", which is what makes
    // infinite-scroll callers fire immediately on mount.
    expect(isScrolledToBottom()).toBe(true);
  });
});
