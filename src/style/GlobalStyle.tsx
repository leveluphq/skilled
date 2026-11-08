import { createGlobalStyle } from 'styled-components';
import { ThemeType, HIGHLIGHT_COLOR } from './theme';

export const FREEZE_CLASS = 'freeze';
export const SMOOTH_SCROLL_CLASS = 'smoothscroll';
export const FONT_FAMILY = "'Open Sans', 'Helvetica Neue', Arial, Helvetica, sans-serif";

const GlobalStyle = createGlobalStyle<{ theme: ThemeType }>`
html,
body {
  background: ${({ theme }) => theme.color.backgroundPrimary};
  color: ${({ theme }) => theme.color.textPrimary};
  padding: 0;
  margin: 0;
  min-height: 100%;
  font-family: ${FONT_FAMILY};
  overflow-anchor: none;
}

.${SMOOTH_SCROLL_CLASS} {
  scroll-behavior: smooth;
}

.${FREEZE_CLASS} {
  overflow-y: hidden;
}

::selection {
  background-color: ${HIGHLIGHT_COLOR};
  color: ${({ theme }) => theme.color.backgroundDistinct};
}

body {
  overflow-x: hidden;
  max-width: 100vw;
  min-width: 320px;
}

* {
  box-sizing: border-box;
}

h1,
h2,
h3,
h4,
h5,
h6,
p {
  margin: 0;
  line-height: 1.425;
}

pre {
  font-family: monospace, monospace;
  font-size: 1em;
  border-radius: 4px;
}

sup {
  font-size: x-small;
}

a {
  color: ${({ theme }) => theme.color.textPrimary};
  text-decoration: none;

  &:visited {
    color: ${({ theme }) => theme.color.textPrimary};
    text-decoration: none;
  }
}

svg {
  fill: ${({ theme }) => theme.color.textPrimary};
}

/* PrismJS 1.15.0
https://prismjs.com/download.html#themes=prism-tomorrow&languages=markup+css+clike+javascript+jsx */
/**
 * prism.js tomorrow night eighties for JavaScript, CoffeeScript, CSS and HTML
 * Based on https://github.com/chriskempson/tomorrow-theme
 * @author Rose Pritchard
 */

code[class*='language-'],
pre[class*='language-'] {
  color: #ccc;
  background: none;
  font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
  text-align: left;
  white-space: pre;
  word-spacing: normal;
  word-break: normal;
  word-wrap: normal;
  line-height: 1.5;
  font-size: 12px;

  -moz-tab-size: 4;
  -o-tab-size: 4;
  tab-size: 4;

  -webkit-hyphens: none;
  -moz-hyphens: none;
  -ms-hyphens: none;
  hyphens: none;
}

/* Code blocks */
pre[class*='language-'] {
  padding: 1em 1.5em;
  padding-top: 1.1em;
  overflow: auto;
}

:not(pre) > code[class*='language-'],
pre[class*='language-'] {
  background: #2F3136;
}

/* Inline code */
:not(pre) > code[class*='language-'] {
  padding: 0.1em;
  border-radius: 0.3em;
  white-space: normal;
}

.token.comment,
.token.block-comment,
.token.prolog,
.token.doctype,
.token.cdata {
  color: #999;
}

.token.punctuation {
  color: #ccc;
}

.token.tag,
.token.attr-name,
.token.namespace,
.token.deleted {
  color: #e2777a;
}

.token.function-name {
  color: #6196cc;
}

.token.boolean,
.token.number,
.token.function {
  color: #f08d49;
}

.token.property,
.token.class-name,
.token.constant,
.token.symbol {
  color: #f8c555;
}

.token.selector,
.token.important,
.token.atrule,
.token.keyword,
.token.builtin {
  color: #cc99cd;
}

.token.string,
.token.char,
.token.attr-value,
.token.regex,
.token.variable {
  color: #7ec699;
}

.token.operator,
.token.entity,
.token.url {
  color: #67cdcc;
}

.token.important,
.token.bold {
  font-weight: bold;
}
.token.italic {
  font-style: italic;
}

.token.entity {
  cursor: help;
}

.token.inserted {
  color: green;
}

`;

export default GlobalStyle;
