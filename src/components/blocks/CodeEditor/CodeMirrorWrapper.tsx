import * as React from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';

// Supported languages
import './codemirrorModes';

// Addons
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/matchbrackets.js';
import 'codemirror/addon/display/placeholder.js';

interface Props {
  mode: string | null;
  value: string;
  placeholder?: string;
  onChange?: (
    editor: CodeMirror.Editor,
    data: CodeMirror.EditorChange,
    value: string,
  ) => void | undefined;
}

const CodeMirrorWrapper: React.FC<Props> = ({ mode, value, onChange, placeholder }) => {
  return (
    <CodeMirror
      autoCursor={false}
      autoScroll={false}
      value={value}
      onChange={onChange}
      options={{
        placeholder: placeholder,
        mode,
        theme: 'material',
        lineNumbers: true,
        smartIndent: true,
        autoCloseTags: true,
        autoCloseBrackets: true,
        matchBrackets: true,
      }}
    />
  );
};

export default CodeMirrorWrapper;
