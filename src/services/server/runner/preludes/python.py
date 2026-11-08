# Skilled runner harness for Python (docs/adding-a-language.md).
# It is appended after the learner's code. Every name it defines starts with
# _sk_ (one underscore: Python mangles names starting with two inside a class)
# and every module it uses is imported under an alias, so code that rebinds
# print, len or json can't break it. It runs on Python 3.14 (Docker, and Judge0
# id 113).
# _sk_config and _sk_run_test are defined by the generated driver that follows.
import builtins as _sk_b
import json as _sk_json
import os as _sk_os
import sys as _sk_sys
import threading as _sk_threading
import time as _sk_time
import traceback as _sk_traceback

_sk_raw = _sk_sys.stdin.buffer.read().decode('utf-8')
_sk_newline = _sk_raw.index('\n')
_sk_nonce = _sk_raw[:_sk_newline]
_sk_tests = _sk_json.loads(_sk_raw[_sk_newline + 1:])['tests']
_sk_MAX_LOG_BYTES = 64 * 1024
_sk_MAX_RESULT_CHARS = 1024 * 1024
_sk_MAX_NODES = 1000000


def _sk_emit(message):
    line = _sk_nonce + _sk_json.dumps(message, separators=(',', ':'), allow_nan=False) + '\n'
    _sk_os.write(1, line.encode('utf-8'))


class _sk_Output(object):
    """Stands in for sys.stdout: writes straight to fd 1, so prints and harness
    lines stay in order, and caps what each test prints."""

    def __init__(self):
        self.logged = 0
        self.truncated = False

    def write(self, text):
        if not isinstance(text, str):
            text = str(text)
        if self.logged >= _sk_MAX_LOG_BYTES:
            if not self.truncated:
                self.truncated = True
                _sk_os.write(1, '\n… (output truncated)\n'.encode('utf-8'))
        else:
            self.logged += _sk_b.len(text)
            _sk_os.write(1, text.encode('utf-8', 'replace'))
        return _sk_b.len(text)

    def flush(self):
        pass

    def isatty(self):
        return False


_sk_output = _sk_Output()
_sk_sys.stdout = _sk_output

# Python 3.8 buffers stderr when it isn't a terminal, so whatever the learner
# wrote to it would be lost when a run is stopped
try:
    _sk_sys.stderr.reconfigure(line_buffering=True)
except Exception:
    pass


class _sk_ListNode(object):
    def __init__(self, data):
        self.data = data
        self.next = None


class _sk_BinaryNode(object):
    def __init__(self, data):
        self.data = data
        self.left = None
        self.right = None


# The learner may define their own node classes; otherwise ours are available
# under the names the lessons use.
if 'ListNode' not in globals():
    ListNode = _sk_ListNode
if 'BinaryNode' not in globals():
    BinaryNode = _sk_BinaryNode


def _sk_build_list(value):
    values = value if isinstance(value, list) else value['values']
    cycle_index = None if isinstance(value, list) else value['cycleIndex']
    head = tail = target = None
    for i, item in _sk_b.enumerate(values):
        node = _sk_ListNode(item)
        if i == cycle_index:
            target = node
        if tail is None:
            head = node
        else:
            tail.next = node
        tail = node
    if tail is not None and target is not None:
        tail.next = target
    return head


def _sk_build_tree(values):
    if not values or values[0] is None:
        return None
    root = _sk_BinaryNode(values[0])
    queue = [root]
    index = 1
    q = 0
    while q < _sk_b.len(queue) and index < _sk_b.len(values):
        node = queue[q]
        q += 1
        if index < _sk_b.len(values) and values[index] is not None:
            node.left = _sk_BinaryNode(values[index])
            queue.append(node.left)
        index += 1
        if index < _sk_b.len(values) and values[index] is not None:
            node.right = _sk_BinaryNode(values[index])
            queue.append(node.right)
        index += 1
    return root


def _sk_to_arg(value, type_name):
    """Converts a JSON argument to what the learner's code receives."""
    if value is None:
        return None
    if type_name.endswith('?'):
        return _sk_to_arg(value, type_name[:-1])
    if type_name == 'ListNode':
        return _sk_build_list(value)
    if type_name == 'BinaryNode':
        return _sk_build_tree(value)
    if type_name.endswith('[]'):
        return [_sk_to_arg(item, type_name[:-2]) for item in value]
    if type_name.startswith('map<string,'):
        value_type = type_name[_sk_b.len('map<string,'):-1]
        return {key: _sk_to_arg(item, value_type) for key, item in value.items()}
    if type_name == 'Interval':
        return {'start': value['start'], 'end': value['end']}
    return value


def _sk_number(value):
    if isinstance(value, float) and (value != value or value in (float('inf'), float('-inf'))):
        return None
    return value


def _sk_from_result(value, type_name):
    """Converts what the learner's code returned to JSON."""
    base_type = type_name[:-1] if type_name.endswith('?') else type_name
    # A list or tree is always reported as an array: [] when it's empty
    if value is None and base_type in ('ListNode', 'BinaryNode'):
        return []
    if value is None:
        return None
    if type_name != base_type:
        return _sk_from_result(value, base_type)
    if type_name == 'void':
        return None
    if type_name == 'ListNode':
        result = []
        node = value
        while node is not None:
            if _sk_b.len(result) >= _sk_MAX_NODES:
                raise ValueError('The returned list never ends (it has a cycle)')
            result.append(_sk_from_result(getattr(node, 'data', None), 'int'))
            node = getattr(node, 'next', None)
        return result
    if type_name == 'BinaryNode':
        levels = []
        queue = [value]
        q = 0
        while q < _sk_b.len(queue):
            if _sk_b.len(queue) > _sk_MAX_NODES:
                raise ValueError('The returned tree is too large (it may contain a cycle)')
            current = queue[q]
            q += 1
            if current is None:
                levels.append(None)
            else:
                levels.append(_sk_from_result(getattr(current, 'data', None), 'int'))
                queue.append(getattr(current, 'left', None))
                queue.append(getattr(current, 'right', None))
        while levels and levels[-1] is None:
            levels.pop()
        return levels
    if type_name == 'BinaryNodeRef':
        return _sk_from_result(getattr(value, 'data', value), 'int')
    if type_name.endswith('[]') and isinstance(value, (list, tuple)):
        return [_sk_from_result(item, type_name[:-2]) for item in value]
    if type_name.startswith('map<string,') and isinstance(value, dict):
        value_type = type_name[_sk_b.len('map<string,'):-1]
        return {str(key): _sk_from_result(value[key], value_type) for key in sorted(value)}
    if isinstance(value, (list, tuple)):
        return [_sk_from_result(item, '') for item in value]
    if isinstance(value, dict):
        return {str(key): _sk_from_result(item, '') for key, item in value.items()}
    if isinstance(value, (set, frozenset)):
        return [_sk_from_result(item, '') for item in value]
    return _sk_number(value)


def _sk_describe(error):
    text = type(error).__name__ + ': ' + str(error)
    frames = _sk_traceback.extract_tb(error.__traceback__)
    lines = [frame.lineno for frame in frames if frame.filename == __file__ and frame.lineno <= _sk_config['user_lines']]
    if lines:
        text += ' (line ' + str(lines[-1]) + ')'
    return text if _sk_b.len(text) <= 500 else text[:500] + '…'


def _sk_run_all():
    for i, test in _sk_b.enumerate(_sk_tests):
        _sk_emit({'t': 'start', 'i': i})
        _sk_output.logged = 0
        _sk_output.truncated = False
        started = _sk_time.perf_counter()
        try:
            out = _sk_run_test(test)
            serialized = _sk_json.dumps(out, allow_nan=False)
            if _sk_b.len(serialized) > _sk_MAX_RESULT_CHARS:
                message = {'t': 'result', 'i': i, 'ok': False, 'error': 'Your answer is too large to report'}
            else:
                message = {'t': 'result', 'i': i, 'ok': True, 'out': out}
        except RecursionError as error:
            message = {'t': 'result', 'i': i, 'ok': False, 'error': 'RecursionError: the recursion went too deep'}
        except BaseException as error:  # noqa: B902 (a test may raise anything, even SystemExit)
            if isinstance(error, (KeyboardInterrupt,)):
                raise
            message = {'t': 'result', 'i': i, 'ok': False, 'error': _sk_describe(error)}
        message['ms'] = round((_sk_time.perf_counter() - started) * 1000, 3)
        _sk_emit(message)
    _sk_emit({'t': 'done'})


def _sk_start():
    # Deep recursion is common in these lessons; give it room, as LeetCode does
    _sk_sys.setrecursionlimit(50000)
    _sk_threading.stack_size(256 * 1024 * 1024)
    thread = _sk_threading.Thread(target=_sk_run_all)
    thread.start()
    thread.join()
