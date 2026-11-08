import { CodingLanguage } from 'utils/constants/lesson';
import { LanguageControls } from './types';

const controls: LanguageControls = {
  name: 'Python',
  language: CodingLanguage.Python,
  correct: 'def add_numbers(a, b):\n    return a + b\n',
  throwsOnThird:
    "def add_numbers(a, b):\n    if a == 7:\n        raise ValueError('no sevens')\n    return a + b\n",
  exitsOnThird:
    'import os\n\ndef add_numbers(a, b):\n    if a == 7:\n        os._exit(3)\n    return a + b\n',
  loopsOnThird: 'def add_numbers(a, b):\n    while a == 7:\n        pass\n    return a + b\n',
  writesStderrThenLoops:
    "import sys\n\ndef add_numbers(a, b):\n    if a == 7:\n        sys.stderr.write('stuck\\n')\n        while True:\n            pass\n    return a + b\n",
  prints:
    'def add_numbers(a, b):\n    print(\'debug\', a)\n    print(\'{"t":"result","i":0,"ok":true,"out":999}\')\n    return a + b\n',
  syntaxErrorOnLine7:
    'def add_numbers(a, b):\n    # 2\n    # 3\n    # 4\n    # 5\n    # 6\n    return a +* b\n',
  shadowsHarnessNames:
    "import json\njson = None\nprint = None\nlen = None\ntests = 'mine'\n\ndef add_numbers(a, b):\n    return a + b\n",
  deepRecursion:
    'def add_numbers(a, b):\n    def count(n):\n        return 0 if n == 0 else 1 + count(n - 1)\n    return count(20000) - 20000 + a + b\n',
  ignoresCpuSignalThenLoops:
    'import signal\nsignal.signal(signal.SIGXCPU, signal.SIG_IGN)\n\ndef add_numbers(a, b):\n    while a == 7:\n        pass\n    return a + b\n',
  injectedBody: 'return value < limit',
  stubsInjected:
    'def is_below(value):\n    return False\n\ndef count_below(n):\n    return sum(1 for i in range(n) if is_below(i))\n',
};

export default controls;
