// A minimal lexer for C-family code (Java, Kotlin, C#, Swift, Rust, Go, C++):
// enough for the normalizers to find top-level declarations and unbalanced
// braces while skipping comments, strings and character literals. It doesn't
// parse anything.

export interface LexOptions {
  // Block comments nest (Kotlin, Swift, Rust)
  nestedComments?: boolean;
  // """text blocks""" (Java, Kotlin, Swift, C# raw strings)
  textBlocks?: boolean;
  // `raw strings` in backquotes (Go)
  backquoteStrings?: boolean;
  // ' starts a character literal, not a lifetime or a label (true except in Rust)
  charLiterals?: boolean;
}

export interface Token {
  text: string;
  start: number;
  end: number;
  // Brace depth before the token
  depth: number;
  line: number;
}

export interface Lexed {
  identifiers: Token[];
  // Unclosed braces at the end, and the lines they opened on
  depth: number;
  openLines: number[];
  // An unterminated comment, string or character literal
  unterminated: { what: string; line: number } | null;
}

const isIdentifierStart = (c: string) => /[A-Za-z_$]/.test(c);
const isIdentifierPart = (c: string) => /[A-Za-z0-9_$]/.test(c);

export const lex = (source: string, options: LexOptions = {}): Lexed => {
  const {
    nestedComments = false,
    textBlocks = false,
    backquoteStrings = false,
    charLiterals = true,
  } = options;
  const identifiers: Token[] = [];
  const openLines: number[] = [];
  let depth = 0;
  let line = 1;
  let i = 0;
  const n = source.length;

  // Advances to `end`, counting lines
  const skipTo = (end: number) => {
    for (; i < end && i < n; i++) {
      if (source[i] === '\n') line++;
    }
  };

  while (i < n) {
    const c = source[i];

    if (c === '\n') {
      line++;
      i++;
      continue;
    }

    if (c === '/' && source[i + 1] === '/') {
      const end = source.indexOf('\n', i);
      i = end < 0 ? n : end;
      continue;
    }

    if (c === '/' && source[i + 1] === '*') {
      const startLine = line;
      let level = 0;
      let j = i;
      while (j < n) {
        if (source[j] === '/' && source[j + 1] === '*') {
          level = nestedComments ? level + 1 : 1;
          j += 2;
        } else if (source[j] === '*' && source[j + 1] === '/') {
          level--;
          j += 2;
          if (level === 0) break;
        } else {
          j++;
        }
      }
      if (level > 0) {
        return {
          identifiers,
          depth,
          openLines,
          unterminated: { what: 'comment', line: startLine },
        };
      }
      skipTo(j);
      continue;
    }

    if (textBlocks && source.startsWith('"""', i)) {
      const startLine = line;
      let j = source.indexOf('"""', i + 3);
      while (j > 0 && source[j - 1] === '\\') j = source.indexOf('"""', j + 1);
      if (j < 0) {
        return {
          identifiers,
          depth,
          openLines,
          unterminated: { what: 'text block', line: startLine },
        };
      }
      skipTo(j + 3);
      continue;
    }

    if (backquoteStrings && c === '`') {
      const startLine = line;
      const j = source.indexOf('`', i + 1);
      if (j < 0) {
        return { identifiers, depth, openLines, unterminated: { what: 'string', line: startLine } };
      }
      skipTo(j + 1);
      continue;
    }

    if (c === '"' || (c === "'" && charLiterals)) {
      let j = i + 1;
      while (j < n && source[j] !== c && source[j] !== '\n') {
        j += source[j] === '\\' ? 2 : 1;
      }
      if (j >= n || source[j] === '\n') {
        return {
          identifiers,
          depth,
          openLines,
          unterminated: { what: c === '"' ? 'string' : 'character literal', line },
        };
      }
      i = j + 1;
      continue;
    }

    if (c === '{') {
      depth++;
      openLines.push(line);
    } else if (c === '}') {
      depth--;
      openLines.pop();
    } else if (isIdentifierStart(c)) {
      let j = i;
      while (j < n && isIdentifierPart(source[j])) j++;
      identifiers.push({ text: source.slice(i, j), start: i, end: j, depth, line });
      i = j;
      continue;
    }

    i++;
  }

  return { identifiers, depth, openLines, unterminated: null };
};

// Replaces source[start, end) with spaces, keeping line breaks, so every
// other character keeps its line and column
export const blank = (source: string, start: number, end: number) =>
  source.slice(0, start) + source.slice(start, end).replace(/[^\n]/g, ' ') + source.slice(end);

// Line-preserving clean-up every language starts with: no BOM, LF line
// endings, and a final newline
export const normalizeText = (code: string) => {
  const text = code.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  return text.endsWith('\n') ? text : `${text}\n`;
};

export const countLines = (text: string) => text.split('\n').length - (text.endsWith('\n') ? 1 : 0);

// Top-level declarations (`class Foo`, `struct Foo`...) with their names
export const declarations = (
  lexed: Lexed,
  keywords: string[],
  atDepth: (depth: number) => boolean,
) => {
  const found: { keyword: string; name: string; line: number; depth: number }[] = [];
  lexed.identifiers.forEach((token, k) => {
    const next = lexed.identifiers[k + 1];
    if (keywords.includes(token.text) && next && atDepth(token.depth) && next.line === token.line) {
      found.push({ keyword: token.text, name: next.text, line: token.line, depth: token.depth });
    }
  });
  return found;
};
