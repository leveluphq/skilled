import styled from 'styled-components';

export const Shell = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.color.backgroundPrimary};
  color: ${({ theme }) => theme.color.textPrimary};
  @media print {
    background: #fff;
    color: #000;
    nav,
    footer,
    > header,
    .print-controls,
    .screen-related {
      display: none !important;
    }
    main {
      max-width: none;
      padding: 0;
    }
    article,
    section {
      break-inside: auto;
    }
    a {
      color: #000;
      text-decoration: underline;
    }
    table,
    pre,
    blockquote {
      break-inside: avoid;
    }
    details {
      display: block;
    }
  }
  a:focus-visible,
  button:focus-visible,
  summary:focus-visible,
  input:focus-visible,
  select:focus-visible,
  textarea:focus-visible {
    outline: 3px solid ${({ theme }) => theme.color.brand};
    outline-offset: 4px;
  }
`;
export const SkipLink = styled.a`
  position: absolute;
  top: -80px;
  left: 16px;
  z-index: 20;
  padding: 12px 18px;
  background: ${({ theme }) => theme.color.backgroundPrimary};
  &:focus {
    top: 12px;
  }
`;
export const Topbar = styled.header`
  border-bottom: 1px solid ${({ theme }) => theme.color.border};
  padding: 20px max(20px, calc((100vw - 1200px) / 2));
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
  > a {
    font-size: 21px;
    font-weight: 800;
  }
  nav {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    font-size: 14px;
  }
  a:hover {
    color: ${({ theme }) => theme.color.brand};
  }
`;
export const Main = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 28px 24px 80px;
  width: 100%;
  @media (max-width: 600px) {
    padding: 24px 18px 56px;
  }
`;
export const Breadcrumbs = styled.nav`
  font-size: 13px;
  line-height: 1.8;
  color: ${({ theme }) => theme.color.textSecondary};
  ol {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    padding: 0;
    margin: 0 0 30px;
    list-style: none;
  }
  li + li:before {
    content: '/';
    margin-right: 10px;
  }
  a {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;
export const Hero = styled.header`
  max-width: 880px;
  margin-bottom: 42px;
  h1 {
    font-size: clamp(30px, 4.6vw, 52px);
    line-height: 1.16;
    letter-spacing: -0.035em;
    margin: 12px 0 20px;
  }
  > p {
    font-size: 19px;
    line-height: 1.75;
    color: ${({ theme }) => theme.color.textSecondary};
  }
`;
export const Eyebrow = styled.p`
  font-size: 12px !important;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 700;
  color: ${({ theme }) => theme.color.brand} !important;
`;
export const Metadata = styled.div`
  font-size: 13px;
  line-height: 1.8;
  margin-top: 18px;
  color: ${({ theme }) => theme.color.textSecondary};
`;
export const ReadingLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 780px) minmax(180px, 260px);
  gap: 60px;
  align-items: start;
  @media (max-width: 950px) {
    display: flex;
    flex-direction: column-reverse;
    gap: 28px;
  }
  @media print {
    display: block;
  }
`;
export const Article = styled.article`
  min-width: 0;
  width: 100%;
  font-size: 17px;
  line-height: 1.9;
  overflow-wrap: anywhere;
  .worksheet-line {
    display: block;
    height: 28px;
    border-bottom: 1px solid currentColor;
    margin: 8px 0 20px;
  }
  p {
    margin: 0 0 22px;
    line-height: 1.9;
  }
  h2 {
    font-size: 28px;
    line-height: 1.35;
    margin: 48px 0 18px;
    letter-spacing: -0.02em;
    scroll-margin-top: 24px;
  }
  h2:first-child {
    margin-top: 0;
  }
  h3 {
    font-size: 21px;
    margin: 30px 0 12px;
    scroll-margin-top: 24px;
  }
  h4 {
    font-size: 18px;
    margin: 24px 0 12px;
  }
  ul,
  ol {
    padding-left: 24px;
    margin: 0 0 24px;
  }
  li {
    margin: 9px 0;
  }
  li p {
    margin: 10px 0;
  }
  a {
    color: ${({ theme }) => theme.color.brand};
    text-decoration: underline;
    text-underline-offset: 4px;
  }
  a:hover {
    text-decoration-thickness: 2px;
  }
  pre {
    padding: 22px !important;
    overflow: auto;
    background: #1f2128 !important;
    margin: 24px 0;
    line-height: 1.7;
  }
  pre code {
    font-size: 14px;
  }
  :not(pre) > code {
    font-size: 0.88em;
    padding: 2px 6px;
    border-radius: 4px;
    background: ${({ theme }) => theme.color.backgroundSecondary};
    overflow-wrap: anywhere;
  }
  table {
    display: block;
    overflow-x: auto;
    max-width: 100%;
    border-collapse: collapse;
    width: 100%;
    font-size: 14px;
    line-height: 1.65;
  }
  th,
  td {
    border: 1px solid ${({ theme }) => theme.color.border};
    padding: 12px;
    text-align: left;
    vertical-align: top;
  }
  td:empty {
    height: 32px;
  }
  th {
    background: ${({ theme }) => theme.color.backgroundSecondary};
  }
  blockquote {
    margin: 24px 0;
    padding: 16px 22px;
    border-left: 3px solid ${({ theme }) => theme.color.brand};
    background: ${({ theme }) => theme.color.backgroundSecondary};
  }
  blockquote p:last-child {
    margin-bottom: 0;
  }
  figure {
    margin: 28px 0;
  }
  img {
    max-width: 100%;
    height: auto;
  }
  figcaption {
    margin-top: 10px;
    font-size: 14px;
    line-height: 1.7;
    color: ${({ theme }) => theme.color.textSecondary};
  }
  details {
    margin: 24px 0;
    padding: 18px;
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: 8px;
  }
  summary {
    cursor: pointer;
    font-weight: 600;
  }
  details[open] summary {
    margin-bottom: 18px;
  }
  @media print {
    font-size: 11pt;
    a {
      color: #000 !important;
    }
    line-height: 1.6;
    h2,
    h3 {
      break-after: avoid;
    }
    p {
      widows: 3;
      orphans: 3;
    }
    pre,
    code,
    .token {
      color: #000 !important;
      background: #fff !important;
    }
    pre {
      white-space: pre-wrap;
      overflow: visible;
    }
    table {
      display: table;
      font-size: 10pt;
    }
    th,
    td {
      padding: 6px;
    }
    th {
      background: #eee;
    }
  }
`;
export const TableScroll = styled.div`
  overflow-x: auto;
  max-width: 100%;
  margin: 24px 0;
  @media print {
    overflow: visible;
  }
`;
export const Contents = styled.aside`
  @media print {
    display: none;
  }
  position: sticky;
  top: 24px;
  font-size: 13px;
  line-height: 1.6;
  > p {
    font-weight: 700;
    margin-bottom: 14px;
  }
  ol {
    margin: 0;
    padding-left: 18px;
  }
  li {
    margin-bottom: 11px;
  }
  a {
    color: ${({ theme }) => theme.color.textSecondary};
  }
  a:hover {
    color: ${({ theme }) => theme.color.brand};
  }
  @media (max-width: 950px) {
    position: static;
    width: 100%;
    padding: 20px;
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: 8px;
  }
`;
export const Section = styled.section`
  margin-top: 56px;
  > h2 {
    font-size: 27px;
    margin-bottom: 16px;
  }
  > p {
    font-size: 16px;
    line-height: 1.8;
    margin-bottom: 22px;
    color: ${({ theme }) => theme.color.textSecondary};
  }
`;
export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: 18px;
`;
export const Card = styled.a`
  display: block;
  padding: 24px;
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: 10px;
  background: ${({ theme }) => theme.color.backgroundSecondary};
  transition: border-color 0.15s;
  &:hover {
    border-color: ${({ theme }) => theme.color.brand};
  }
  h3,
  h4 {
    font-size: 18px;
    line-height: 1.5;
    margin: 8px 0 12px;
  }
  p {
    font-size: 14px;
    line-height: 1.8;
    color: ${({ theme }) => theme.color.textSecondary};
  }
  small {
    font-size: 11px;
    color: ${({ theme }) => theme.color.brand};
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
`;
export const Bottom = styled.footer`
  border-top: 1px solid ${({ theme }) => theme.color.border};
  padding: 40px 24px;
  font-size: 13px;
  line-height: 1.8;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  display: grid;
  grid-template-columns: minmax(180px, 0.65fr) minmax(0, 1.35fr);
  align-items: start;
  gap: 40px;
  .footer-brand {
    font-size: 21px;
    font-weight: 800;
    text-decoration: none;
  }
  > div p {
    margin: 14px 0 0;
    font-size: 14px;
    line-height: 1.8;
    color: ${({ theme }) => theme.color.textSecondary};
    max-width: 30ch;
  }
  @media (max-width: 800px) {
    grid-template-columns: minmax(0, 1fr);
    gap: 32px;
  }
  @media (max-width: 600px) {
    padding: 32px 18px;
  }
`;
export const ToolPanel = styled.section`
  padding: 24px;
  margin-bottom: 44px;
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: 12px;
  background: ${({ theme }) => theme.color.backgroundSecondary};
  h2 {
    font-size: 23px;
    margin-bottom: 16px;
  }
  h3 {
    font-size: 18px;
    line-height: 1.6;
    margin: 20px 0 12px;
  }
  li,
  legend,
  summary {
    font-size: 14px;
    line-height: 1.8;
  }
  summary {
    cursor: pointer;
    min-height: 44px;
    padding: 10px 0;
  }
  details {
    margin-top: 20px;
  }
  details section {
    margin: 24px 0;
  }
  p {
    font-size: 14px;
    line-height: 1.8;
    margin: 12px 0;
  }
  label {
    font-size: 14px;
    line-height: 1.6;
    display: block;
  }
  input:not([type='checkbox']):not([type='range']):not([type='radio']),
  select,
  textarea {
    display: block;
    width: 100%;
    min-height: 44px;
    padding: 10px;
    margin-top: 6px;
    border-radius: 5px;
    border: 1px solid ${({ theme }) => theme.color.border};
    color: ${({ theme }) => theme.color.textPrimary};
    background: ${({ theme }) => theme.color.backgroundPrimary};
    font: inherit;
  }
  textarea {
    min-height: 140px;
    font-family: monospace !important;
  }
  input[type='range'] {
    width: 100%;
    accent-color: ${({ theme }) => theme.color.brand};
  }
  input[type='checkbox'] {
    accent-color: ${({ theme }) => theme.color.brand};
    margin-right: 8px;
  }
  button {
    padding: 10px 16px;
    min-height: 44px;
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: 6px;
    background: ${({ theme }) => theme.color.backgroundPrimary};
    color: ${({ theme }) => theme.color.textPrimary};
    font: inherit;
    cursor: pointer;
  }
  button:hover:enabled {
    border-color: ${({ theme }) => theme.color.brand};
  }
  button:disabled {
    opacity: 0.45;
    cursor: default;
  }
  button[aria-pressed='true'] {
    border-color: ${({ theme }) => theme.color.brand};
    color: ${({ theme }) => theme.color.brand};
  }
  output {
    font-variant-numeric: tabular-nums;
  }
  svg {
    display: block;
    width: 100%;
    height: auto;
    fill: none;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    line-height: 1.6;
  }
  td,
  th {
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.color.border};
    padding: 10px 8px;
  }
  @media (max-width: 600px) {
    padding: 16px;
  }
`;
export const Controls = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr));
  gap: 20px;
  margin: 20px 0;
`;
export const Buttons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 18px 0;
`;
export const PrintActions = styled(Buttons)`
  button {
    min-height: 44px;
    padding: 10px 18px;
    border-radius: 6px;
    border: 1px solid ${({ theme }) => theme.color.border};
    color: ${({ theme }) => theme.color.textPrimary};
    background: ${({ theme }) => theme.color.backgroundSecondary};
    font: inherit;
    cursor: pointer;
  }
`;
export const ErrorText = styled.p`
  color: #ff9e9e;
`;
export const Diagram = styled.div`
  max-width: 100%;
  overflow-x: auto;
  margin: 20px 0;
  svg {
    min-width: 720px;
  }
`;
