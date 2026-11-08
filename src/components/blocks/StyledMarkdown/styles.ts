import styled from 'styled-components';
import { mobile } from 'style/breakpoints';
import { MAX_CONTENT_WIDTH, CONTAINER_STYLES, CONTAINER_PAD } from 'style/elements';

export const BLOCK_MARGIN = 24;

export const Content = styled.div`
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  word-wrap: break-word;
  line-height: 1.85;
  font-size: 16px;
  font-weight: 300;

  /* Customizing these styles */
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin-bottom: 0;
    margin-top: 0;
    ${CONTAINER_STYLES};
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p {
    line-height: 1.85;
  }

  dl,
  ol,
  p,
  pre,
  ul {
    ${CONTAINER_STYLES};
  }

  /* Blockquotes will also have a <p> inside, so don't dupe styles */
  blockquote {
    ${CONTAINER_STYLES};
    max-width: ${MAX_CONTENT_WIDTH - 2 * CONTAINER_PAD}px;
    border-left: 0.25em solid ${({ theme }) => theme.color.textSecondary};
    color: ${({ theme }) => theme.color.textSecondary};
    margin-bottom: 0;
    margin-top: ${BLOCK_MARGIN}px;
    padding: 0;

    p {
      margin: 0;
    }

    a,
    a:visited,
    a:focus {
      color: inherit;
    }
  }

  pre {
    ${CONTAINER_STYLES};
    /* margin-bottom: 24px; */
    margin-top: 24px;
  }

  p {
    ${CONTAINER_STYLES};
    margin-bottom: 0;
    margin-top: ${BLOCK_MARGIN}px;
  }

  ol,
  ul {
    ${CONTAINER_STYLES};
    margin-bottom: 0;
    margin-top: ${BLOCK_MARGIN}px;

    li {
      padding: 0 ${CONTAINER_PAD / 2}px;
      margin-left: ${3 * CONTAINER_PAD}px;

      ${mobile()} {
        margin-left: ${CONTAINER_PAD}px;
      }
    }
  }

  /* End custom styles */

  .octicon {
    display: inline-block;
    fill: currentColor;
    vertical-align: text-bottom;
  }

  .anchor {
    float: left;
    line-height: 1;
    margin-left: -20px;
    padding-right: 4px;
  }

  .anchor:focus {
    outline: none;
  }

  h1:hover .anchor,
  h2:hover .anchor,
  h3:hover .anchor,
  h4:hover .anchor,
  h5:hover .anchor,
  h6:hover .anchor {
    text-decoration: none;
  }

  .pl-c {
    color: #6a737d;
  }

  .pl-c1,
  .pl-s .pl-v {
    color: #005cc5;
  }

  .pl-e,
  .pl-en {
    color: #6f42c1;
  }

  .pl-s .pl-s1,
  .pl-smi {
    color: #24292e;
  }

  .pl-ent {
    color: #22863a;
  }

  .pl-k {
    color: #d73a49;
  }

  .pl-pds,
  .pl-s,
  .pl-s .pl-pse .pl-s1,
  .pl-sr,
  .pl-sr .pl-cce,
  .pl-sr .pl-sra,
  .pl-sr .pl-sre {
    color: #032f62;
  }

  .pl-smw,
  .pl-v {
    color: #e36209;
  }

  .pl-bu {
    color: #b31d28;
  }

  .pl-ii {
    background-color: #b31d28;
    color: #fafbfc;
  }

  .pl-c2 {
    background-color: #d73a49;
    color: #fafbfc;
  }

  .pl-c2:before {
    content: '^M';
  }

  .pl-sr .pl-cce {
    color: #22863a;
    font-weight: 700;
  }

  .pl-ml {
    color: #735c0f;
  }

  .pl-mh,
  .pl-mh .pl-en,
  .pl-ms {
    color: #005cc5;
    font-weight: 700;
  }

  .pl-mi {
    color: #24292e;
    font-style: italic;
  }

  .pl-mb {
    color: #24292e;
    font-weight: 700;
  }

  .pl-md {
    background-color: #ffeef0;
    color: #b31d28;
  }

  .pl-mi1 {
    background-color: #f0fff4;
    color: #22863a;
  }

  .pl-mc {
    background-color: #ffebda;
    color: #e36209;
  }

  .pl-mi2 {
    background-color: #005cc5;
    color: #f6f8fa;
  }

  .pl-mdr {
    color: #6f42c1;
    font-weight: 700;
  }

  .pl-ba {
    color: #586069;
  }

  .pl-sg {
    color: #959da5;
  }

  .pl-corl {
    color: #032f62;
    text-decoration: underline;
  }

  details {
    display: block;
  }

  summary {
    display: list-item;
  }

  a {
    background-color: transparent;
  }

  a:active,
  a:hover {
    outline-width: 0;
  }

  strong {
    font-weight: inherit;
    font-weight: bolder;
  }

  h1 {
    font-size: 2em;
  }

  img {
    border-style: none;
  }

  code,
  kbd,
  pre {
    font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
    font-size: 1em;
  }

  hr {
    box-sizing: content-box;
    height: 0;
    overflow: visible;
  }

  input {
    font: inherit;
    margin: 0;
  }

  input {
    overflow: visible;
  }

  [type='checkbox'] {
    box-sizing: border-box;
    padding: 0;
  }

  * {
    box-sizing: border-box;
  }

  input {
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
  }

  a {
    text-decoration: underline;
  }

  a:hover,
  a:visited {
    text-decoration: underline;
  }

  strong {
    font-weight: 700;
  }

  hr {
    background: transparent;
    border: 0;
    border-bottom: 1px solid ${({ theme }) => theme.color.border};
    overflow: hidden;
  }

  hr:before {
    content: '';
    display: table;
  }

  hr:after {
    clear: both;
    content: '';
    display: table;
  }

  table {
    border-collapse: collapse;
    border-spacing: 0;
  }

  td,
  th {
    padding: 0;
  }

  details summary {
    cursor: pointer;
  }

  h1 {
    font-size: 28px;
  }

  h1,
  h2 {
    font-weight: 600;
  }

  h2 {
    color: ${({ theme }) => theme.color.brand};
    font-size: 24px;

    em {
      color: ${({ theme }) => theme.color.textPrimary};
    }
  }

  h3 {
    color: ${({ theme }) => theme.color.textPrimary};
    font-size: 20px;
    margin-top: 32px;
  }

  h3,
  h4 {
    font-weight: 600;
  }

  h4 {
    font-size: 20px;
  }

  h5 {
    font-size: 16px;
  }

  h5,
  h6 {
    font-weight: 600;
  }

  h6 {
    font-size: 12px;
  }

  ol ol,
  ul ol {
    list-style-type: lower-roman;
  }

  ol ol ol,
  ol ul ol,
  ul ol ol,
  ul ul ol {
    list-style-type: lower-alpha;
  }

  dd {
    margin-left: 0;
  }

  code,
  pre {
    font-size: 12px;
  }

  input::-webkit-inner-spin-button,
  input::-webkit-outer-spin-button {
    -webkit-appearance: none;
    appearance: none;
    margin: 0;
  }

  .border {
    border: 1px solid #e1e4e8 !important;
  }

  .border-0 {
    border: 0 !important;
  }

  .border-bottom {
    border-bottom: 1px solid #e1e4e8 !important;
  }

  .rounded-1 {
    border-radius: 3px !important;
  }

  .bg-white {
    background-color: #fff !important;
  }

  .bg-gray-light {
    background-color: #fafbfc !important;
  }

  .text-gray-light {
    color: #6a737d !important;
  }

  .mb-0 {
    margin-bottom: 0 !important;
  }

  .my-2 {
    margin-bottom: 8px !important;
    margin-top: 8px !important;
  }

  .pl-0 {
    padding-left: 0 !important;
  }

  .py-0 {
    padding-bottom: 0 !important;
    padding-top: 0 !important;
  }

  .pl-1 {
    padding-left: 4px !important;
  }

  .pl-2 {
    padding-left: 8px !important;
  }

  .py-2 {
    padding-bottom: 8px !important;
    padding-top: 8px !important;
  }

  .pl-3,
  .px-3 {
    padding-left: 16px !important;
  }

  .px-3 {
    padding-right: 16px !important;
  }

  .pl-4 {
    padding-left: 24px !important;
  }

  .pl-5 {
    padding-left: 32px !important;
  }

  .pl-6 {
    padding-left: 40px !important;
  }

  .f6 {
    font-size: 12px !important;
  }

  .lh-condensed {
    line-height: 1.25 !important;
  }

  .text-bold {
    font-weight: 600 !important;
  }

  .markdown-body:before {
    content: '';
    display: table;
  }

  .markdown-body:after {
    clear: both;
    content: '';
    display: table;
  }

  > :first-child {
    margin-top: 0 !important;
  }

  > :last-child {
    margin-bottom: 0 !important;
  }

  a:not([href]) {
    color: inherit;
    text-decoration: none;
  }

  hr {
    background-color: ${({ theme }) => theme.color.border};
    border: 0;
    height: 1px;
    padding: 0;
  }

  kbd {
    background-color: #fafbfc;
    border: 1px solid #c6cbd1;
    border-bottom-color: #959da5;
    border-radius: 3px;
    box-shadow: inset 0 -1px 0 #959da5;
    color: #444d56;
    display: inline-block;
    font-size: 11px;
    line-height: 10px;
    padding: 3px 5px;
    vertical-align: middle;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-weight: 600;
    line-height: 1.25;
    margin-bottom: 16px;
    padding-bottom: 2px;
  }

  h1 {
    font-size: 1.8em;
  }

  h2 {
    font-size: 1.6em;
  }

  h3 {
    font-size: 1.4em;
  }

  h4 {
    font-size: 1.25em;
  }

  h5 {
    font-size: 0.875em;
  }

  h6 {
    color: #6a737d;
    font-size: 0.85em;
  }

  ol ol,
  ol ul,
  ul ol,
  ul ul {
    margin-bottom: 0;
    margin-top: 0;
  }

  li {
    word-wrap: break-all;
  }

  li > p {
    margin-top: 16px;
  }

  li + li {
    margin-top: 0.25em;
  }

  dl {
    padding: 0;
  }

  dl dt {
    font-size: 1em;
    font-style: italic;
    font-weight: 600;
    margin-top: 16px;
    padding: 0;
  }

  dl dd {
    margin-bottom: 16px;
    padding: 0 16px;
  }

  table {
    overflow: auto;
  }

  table th {
    font-weight: 600;
  }

  table td,
  table th {
    padding: 6px 13px;
  }

  img {
    background-color: #fff;
    box-sizing: content-box;
    max-width: 100%;
  }

  img[align='right'] {
    padding-left: 20px;
  }

  img[align='left'] {
    padding-right: 20px;
  }

  code {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    font-size: 80%;
    margin: 0;
    padding: 0.2em 0.35em;
    padding-top: 0.3em;
    margin-left: 1px;
    margin-right: 1px;
    vertical-align: middle;
  }

  pre {
    word-wrap: normal;
  }

  pre > code {
    background: transparent;
    border: 0;
    font-size: 100%;
    margin: 0;
    padding: 0;
    white-space: pre;
    word-break: normal;
  }

  .highlight {
    margin-bottom: 16px;
  }

  .highlight pre {
    margin-bottom: 0;
    word-break: normal;
  }

  .highlight pre,
  pre {
    font-size: 85%;
    line-height: 1.45;
    overflow: auto;
    padding: 16px;
  }

  pre code {
    background-color: transparent;
    border: 0;
    display: inline;
    line-height: inherit;
    margin: 0;
    max-width: auto;
    overflow: visible;
    padding: 0;
    word-wrap: normal;
  }

  .commit-tease-sha {
    color: #444d56;
    display: inline-block;
    font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
    font-size: 90%;
  }

  .blob-wrapper {
    border-bottom-left-radius: 3px;
    border-bottom-right-radius: 3px;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .blob-wrapper-embedded {
    max-height: 240px;
    overflow-y: auto;
  }

  .blob-num {
    -moz-user-select: none;
    -ms-user-select: none;
    -webkit-user-select: none;
    color: rgba(27, 31, 35, 0.3);
    cursor: pointer;
    font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
    font-size: 12px;
    line-height: 20px;
    min-width: 50px;
    padding-left: 10px;
    padding-right: 10px;
    text-align: right;
    user-select: none;
    vertical-align: top;
    white-space: nowrap;
    width: 1%;
  }

  .blob-num:hover {
    color: rgba(27, 31, 35, 0.6);
  }

  .blob-num:before {
    content: attr(data-line-number);
  }

  .blob-code {
    line-height: 20px;
    padding-left: 10px;
    padding-right: 10px;
    position: relative;
    vertical-align: top;
  }

  .blob-code-inner {
    color: #24292e;
    font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
    font-size: 12px;
    overflow: visible;
    white-space: pre;
    word-wrap: normal;
  }

  .pl-token.active,
  .pl-token:hover {
    background: #ffea7f;
    cursor: pointer;
  }

  kbd {
    background-color: #fafbfc;
    border: 1px solid #d1d5da;
    border-bottom-color: #c6cbd1;
    border-radius: 3px;
    box-shadow: inset 0 -1px 0 #c6cbd1;
    color: #444d56;
    display: inline-block;
    font: 11px Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
    line-height: 10px;
    padding: 3px 5px;
    vertical-align: middle;
  }

  :checked + .radio-label {
    border-color: #0366d6;
    position: relative;
    z-index: 1;
  }

  .tab-size[data-tab-size='1'] {
    -moz-tab-size: 1;
    tab-size: 1;
  }

  .tab-size[data-tab-size='2'] {
    -moz-tab-size: 2;
    tab-size: 2;
  }

  .tab-size[data-tab-size='3'] {
    -moz-tab-size: 3;
    tab-size: 3;
  }

  .tab-size[data-tab-size='4'] {
    -moz-tab-size: 4;
    tab-size: 4;
  }

  .tab-size[data-tab-size='5'] {
    -moz-tab-size: 5;
    tab-size: 5;
  }

  .tab-size[data-tab-size='6'] {
    -moz-tab-size: 6;
    tab-size: 6;
  }

  .tab-size[data-tab-size='7'] {
    -moz-tab-size: 7;
    tab-size: 7;
  }

  .tab-size[data-tab-size='8'] {
    -moz-tab-size: 8;
    tab-size: 8;
  }

  .tab-size[data-tab-size='9'] {
    -moz-tab-size: 9;
    tab-size: 9;
  }

  .tab-size[data-tab-size='10'] {
    -moz-tab-size: 10;
    tab-size: 10;
  }

  .tab-size[data-tab-size='11'] {
    -moz-tab-size: 11;
    tab-size: 11;
  }

  .tab-size[data-tab-size='12'] {
    -moz-tab-size: 12;
    tab-size: 12;
  }

  .task-list-item {
    list-style-type: none;
  }

  .task-list-item + .task-list-item {
    margin-top: 3px;
  }

  .task-list-item input {
    margin: 0 0.2em 0.25em -1.6em;
    vertical-align: middle;
  }

  .pl-0 {
    padding-left: 0 !important;
  }

  .pl-1 {
    padding-left: 4px !important;
  }

  .pl-2 {
    padding-left: 8px !important;
  }

  .pl-3 {
    padding-left: 16px !important;
  }

  .pl-4 {
    padding-left: 24px !important;
  }

  .pl-5 {
    padding-left: 32px !important;
  }

  .pl-6 {
    padding-left: 40px !important;
  }

  .pl-7 {
    padding-left: 48px !important;
  }

  .pl-8 {
    padding-left: 64px !important;
  }

  .pl-9 {
    padding-left: 80px !important;
  }

  .pl-10 {
    padding-left: 96px !important;
  }

  .pl-11 {
    padding-left: 112px !important;
  }

  .pl-12 {
    padding-left: 128px !important;
  }
`;
