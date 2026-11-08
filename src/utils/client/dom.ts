import { FREEZE_CLASS, SMOOTH_SCROLL_CLASS } from 'style/GlobalStyle';

export enum KeyCodes {
  Backspace = 8,
  Enter = 13,
  Esc = 27,
}

export const isLastChild = (el: HTMLDivElement) => !el.nextElementSibling;

export const hasChildren = (el: HTMLElement | null) => !!el && el.hasChildNodes();

export const freezeBody = () => {
  document.body.classList.add(FREEZE_CLASS);
};

export const unfreezeBody = () => {
  document.body.classList.remove(FREEZE_CLASS);
};

export const smoothScrollLinks = () => {
  document.body.classList.add(SMOOTH_SCROLL_CLASS);
  document.documentElement.classList.add(SMOOTH_SCROLL_CLASS);
};

export const unSmoothScrollLinks = () => {
  document.body.classList.remove(SMOOTH_SCROLL_CLASS);
  document.documentElement.classList.remove(SMOOTH_SCROLL_CLASS);
};

export const isScrolledToBottom = () => {
  return window.innerHeight + window.pageYOffset + 1 >= document.body.offsetHeight;
};
