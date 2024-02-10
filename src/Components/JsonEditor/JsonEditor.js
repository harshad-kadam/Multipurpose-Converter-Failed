import React from 'react';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-tomorrow';

import './JsonEditor.css';
import '../../ResponsiveStyles.css';

const JsonEditor = ({ json, payloadType }) => {
    return (
      <AceEditor
        className="json-editor"
        mode={payloadType}
        theme="tomorrow_night"
        readOnly={true}
        value={json}
        name="json-editor"
        editorProps={{ $blockScrolling: true }}
        // editorProps={{ $blockScrolling: Infinity }}
        setOptions={{
          useWorker: false,
          showLineNumbers: true,
          tabSize: 2,
        }}
      />
    );
  };

export default JsonEditor;
