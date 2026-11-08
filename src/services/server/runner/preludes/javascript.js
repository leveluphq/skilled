// Skilled runner harness for JavaScript and TypeScript (docs/adding-a-language.md).
// It is appended after the learner's code, inside a function so none of its
// names can clash with theirs. It runs on Node.js 24 (Docker) and 22 (Judge0
// id 102), and as TypeScript compiled for ES2022 (TypeScript 7, or 5.6 on Judge0).
// __CONFIG__ is defined by the generated driver that follows this prelude.
var __fs = require('fs');
var __input = __fs.readFileSync(0, 'utf8');
var __newline = __input.indexOf('\n');
var __nonce = __input.slice(0, __newline);
var __tests = JSON.parse(__input.slice(__newline + 1)).tests;
var __MAX_LOG_BYTES = 64 * 1024;
var __MAX_RESULT_CHARS = 1024 * 1024;

var __emit = function (message) {
  __fs.writeSync(1, __nonce + JSON.stringify(message) + '\n');
};

// Everything the learner prints goes through process.stdout. Count it per test
// so a print loop ends that test's logs instead of the whole run.
var __logged = 0;
var __truncated = false;
var __rawWrite = process.stdout.write.bind(process.stdout);
process.stdout.write = function (chunk, encoding, callback) {
  var text = typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString('utf8');
  if (__logged >= __MAX_LOG_BYTES) {
    if (!__truncated) {
      __truncated = true;
      __fs.writeSync(1, '\n… (output truncated)\n');
    }
  } else {
    __logged += text.length;
    __fs.writeSync(1, text);
  }
  if (typeof encoding === 'function') {
    encoding();
  } else if (typeof callback === 'function') {
    callback();
  }
  return true;
};

class __ListNode {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class __BinaryNode {
  constructor(data) {
    this.data = data;
    this.left = null;
    this.right = null;
  }
}

// The learner may define their own node classes; otherwise ours are available
// under the names the lessons use.
if (typeof globalThis.ListNode === 'undefined') {
  globalThis.ListNode = __ListNode;
}
if (typeof globalThis.BinaryNode === 'undefined') {
  globalThis.BinaryNode = __BinaryNode;
}

var __buildList = function (value) {
  var values = Array.isArray(value) ? value : value.values;
  var cycleIndex = Array.isArray(value) ? null : value.cycleIndex;
  var head = null;
  var tail = null;
  var target = null;
  for (var i = 0; i < values.length; i++) {
    var node = new __ListNode(values[i]);
    if (i === cycleIndex) {
      target = node;
    }
    if (tail) {
      tail.next = node;
    } else {
      head = node;
    }
    tail = node;
  }
  if (tail && target) {
    tail.next = target;
  }
  return head;
};

var __buildTree = function (values) {
  if (!values.length || values[0] === null) {
    return null;
  }
  var root = new __BinaryNode(values[0]);
  var queue = [root];
  var index = 1;
  for (var q = 0; q < queue.length && index < values.length; q++) {
    var node = queue[q];
    if (index < values.length && values[index] !== null) {
      node.left = new __BinaryNode(values[index]);
      queue.push(node.left);
    }
    index++;
    if (index < values.length && values[index] !== null) {
      node.right = new __BinaryNode(values[index]);
      queue.push(node.right);
    }
    index++;
  }
  return root;
};

// Converts a JSON argument to what the learner's code receives
var __toArg = function (value, type) {
  if (value === null) {
    return null;
  }
  if (type.charAt(type.length - 1) === '?') {
    return __toArg(value, type.slice(0, -1));
  }
  if (type === 'ListNode') {
    return __buildList(value);
  }
  if (type === 'BinaryNode') {
    return __buildTree(value);
  }
  if (type.slice(-2) === '[]') {
    var itemType = type.slice(0, -2);
    return value.map(function (item) {
      return __toArg(item, itemType);
    });
  }
  if (type.indexOf('map<string,') === 0) {
    var valueType = type.slice('map<string,'.length, -1);
    var map = {};
    Object.keys(value).forEach(function (key) {
      map[key] = __toArg(value[key], valueType);
    });
    return map;
  }
  if (type === 'Interval') {
    return { start: value.start, end: value.end };
  }
  return value;
};

var __MAX_NODES = 1000000;

// Converts what the learner's code returned to JSON
var __fromResult = function (value, type) {
  var baseType = type.charAt(type.length - 1) === '?' ? type.slice(0, -1) : type;
  // A list or tree is always reported as an array: [] when it's empty
  if (
    (value === null || value === undefined) &&
    (baseType === 'ListNode' || baseType === 'BinaryNode')
  ) {
    return [];
  }
  if (value === null || value === undefined) {
    return null;
  }
  if (type !== baseType) {
    return __fromResult(value, baseType);
  }
  if (type === 'void') {
    return null;
  }
  if (type === 'ListNode') {
    var list = [];
    for (var node = value; node; node = node.next) {
      if (list.length >= __MAX_NODES) {
        throw new Error('The returned list never ends (it has a cycle)');
      }
      list.push(__fromResult(node.data, 'int'));
    }
    return list;
  }
  if (type === 'BinaryNode') {
    var levels = [];
    var queue = [value];
    for (var q = 0; q < queue.length; q++) {
      if (queue.length > __MAX_NODES) {
        throw new Error('The returned tree is too large (it may contain a cycle)');
      }
      var current = queue[q];
      levels.push(current ? __fromResult(current.data, 'int') : null);
      if (current) {
        queue.push(current.left || null, current.right || null);
      }
    }
    while (levels.length && levels[levels.length - 1] === null) {
      levels.pop();
    }
    return levels;
  }
  if (type === 'BinaryNodeRef') {
    return typeof value === 'object' && 'data' in value ? __fromResult(value.data, 'int') : value;
  }
  if (type.slice(-2) === '[]' && Array.isArray(value)) {
    var itemType = type.slice(0, -2);
    return value.map(function (item) {
      return __fromResult(item, itemType);
    });
  }
  if (type.indexOf('map<string,') === 0 && typeof value === 'object') {
    var valueType = type.slice('map<string,'.length, -1);
    var map = {};
    Object.keys(value)
      .sort()
      .forEach(function (key) {
        map[key] = __fromResult(value[key], valueType);
      });
    return map;
  }
  if (typeof value === 'number' && !isFinite(value)) {
    return null;
  }
  if (typeof value === 'bigint') {
    return Number(value);
  }
  if (Array.isArray(value)) {
    return value.map(function (item) {
      return __fromResult(item, '');
    });
  }
  return value;
};

// "TypeError: x is not a function (line 3)", with the line only when it's in
// the learner's code
var __describe = function (error) {
  if (!(error instanceof Error)) {
    return 'Thrown: ' + String(error);
  }
  var text = error.name + ': ' + error.message;
  var stack = String(error.stack || '');
  var match = /script\.js:(\d+):\d+/.exec(stack);
  if (match && __CONFIG__.reportLines && Number(match[1]) <= __CONFIG__.userLines) {
    text += ' (line ' + match[1] + ')';
  }
  return text.length > 500 ? text.slice(0, 500) + '…' : text;
};

var __now = function () {
  var time = process.hrtime();
  return time[0] * 1000 + time[1] / 1e6;
};

var __run = function (runTest) {
  for (var i = 0; i < __tests.length; i++) {
    __emit({ t: 'start', i: i });
    __logged = 0;
    __truncated = false;
    var started = __now();
    var message;
    try {
      var out = runTest(__tests[i]);
      var serialized = JSON.stringify(out === undefined ? null : out);
      message =
        serialized.length > __MAX_RESULT_CHARS
          ? { t: 'result', i: i, ok: false, error: 'Your answer is too large to report' }
          : { t: 'result', i: i, ok: true, out: out === undefined ? null : out };
    } catch (error) {
      message = { t: 'result', i: i, ok: false, error: __describe(error) };
    }
    message.ms = Math.round((__now() - started) * 1000) / 1000;
    __emit(message);
  }
  __emit({ t: 'done' });
};
