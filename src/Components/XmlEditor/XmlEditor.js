import React from 'react';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-xml';
import 'ace-builds/src-noconflict/theme-tomorrow';

import './XmlEditor.css';
import '../../ResponsiveStyles.css';

const XmlEditor = ({ xml, onChange, payloadType}) => {
    return (
      <AceEditor
        className="xml-editor"
        mode={payloadType}
        theme="tomorrow_night"
        value={xml}
        onChange={onChange}
        name="xml-editor"
        editorProps={{ $blockScrolling: true }}
        setOptions={{
          useWorker: false,
          showLineNumbers: true,
          tabSize: 2//,
          //markers:[{ startRow: 0, startCol: 2, endRow: 1, endCol: 20, className: 'error-marker', type: 'background' }]
        }}
      />
    );
  };
  

export default XmlEditor;
