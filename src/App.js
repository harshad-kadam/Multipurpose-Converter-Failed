import React, { useEffect, useState } from 'react';
import Converter from './Layouts/Home/Converter';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import vkbeautify from 'vkbeautify';
import { minify } from 'xml-minifier';
const CONSTANTS = require('../src/Config/Constants');
import { handleApiError} from '../src/Utils/errorHandling';
import './App.css';
// import Header from '../src/Layouts/Header/Header';
// import Footer from '../src/Layouts/Footer/Footer';


function App() {

  const [errorMessages, setErrorMessages] = useState([]);
  const [isDropdownOpen, setDropdownOpen] = useState(false);


  // Load XML and JSON from local storage on component mount
  const [leftSidePayload, setLeftSidePayload] = useState(localStorage.getItem('leftSidePayload') || '');
  const [rightSidePayload, setRightSidePayload] = useState(localStorage.getItem('rightSidePayload') || '');

  useEffect(() => {
    localStorage.setItem('leftSidePayload', leftSidePayload);
    localStorage.setItem('rightSidePayload', rightSidePayload);
  }, [leftSidePayload, rightSidePayload]);




  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  // -----------XML ToolBar functionalities-----------

  const handleBeautifyXml = () => {
    const beautifiedXml = vkbeautify.xml(leftSidePayload).trim();
    setLeftSidePayload(beautifiedXml);
    setDropdownOpen(false);
  };

  const handleMinifyXml = () => {
    try {
      const minifiedXml = minify(leftSidePayload);
      setLeftSidePayload(minifiedXml);
      setDropdownOpen(false);
    } catch (error) {
      console.error('Error minifying XML:', error);
      handleApiError(setErrorMessages, "Failed to minify XML. Please check your input and try again.");
    }
  };

  // Function to sort XML
  const sortXmlAttributes = (xmlString) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'application/xml');

    const sortAttributes = (element) => {
      if (element.nodeType === 1) { // Check if it's an element node
        const sortedAttributes = Array.from(element.attributes)
          .sort((a, b) => a.name.localeCompare(b.name));

        for (const attribute of sortedAttributes) {
          const { name, value } = attribute;
          element.removeAttribute(name);
          element.setAttribute(name, value);
        }

        // Recursively sort attributes for child elements
        for (const childElement of element.children) {
          sortAttributes(childElement);
        }
      }
    };

    sortAttributes(xmlDoc.documentElement);

    const serializer = new XMLSerializer();
    return serializer.serializeToString(xmlDoc);
  };

  const handleSortXmlKeys = () => {
    const sortedXml = sortXmlAttributes(leftSidePayload);
    setLeftSidePayload(sortedXml);
  };

  const handleValidXml = () => {
    const parser = new DOMParser();
    setDropdownOpen(false);
    try {
      const xmlDoc = parser.parseFromString(leftSidePayload, 'application/xml');

      if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
        throw new Error('Invalid XML');
      }
      setErrorMessages([{ type: 'success', message: 'Valid XML Provided!' }]);
      setTimeout(() => {
        setErrorMessages([]);
      }, 2500);
    } catch (error) {
      console.error('Invalid XML:', error);
      setErrorMessages([{ type: 'warning', message: 'Invalid XML Provided!' }]);
      setTimeout(() => {
        setErrorMessages([]);
      }, 2500);
    }
  };

  const handleSampleXml = () => {
    const sampleXml = CONSTANTS.sampleXmlData;
    setLeftSidePayload(sampleXml);
    setDropdownOpen(false);
  };

  const handleClearXml = () => {
    setLeftSidePayload('');
    setDropdownOpen(false);
    setErrorMessages([]);
    //setError(null);
  };

  const handleCopyXml = () => {
    //logic to copy the Payload to the clipboard here
    navigator.clipboard.writeText(leftSidePayload).then(() => {
      setErrorMessages([{ type: 'info', message: 'Copied to Clipboard' }]);
      setTimeout(() => {
        setErrorMessages([]);
      }, 2500);
    }).catch((error) => {
      console.error('Error copying XML:', error);
      setErrorMessages([{ type: 'warning', message: 'Failed to copy XML' }]);
      setTimeout(() => {
        setErrorMessages([]);
      }, 2500);
    });
    setDropdownOpen(false);
  };

  // -----------XML & JSON Common ToolBar functionalities-----------
  const handleClearAll = () => {
    setLeftSidePayload('');
    setRightSidePayload('');
    setDropdownOpen(false);
    setErrorMessages([]);
    //setError(null);
  };

  const handleOpenFile = (event, paneTypeXorJ) => {
    let fileInput;
    if (paneTypeXorJ === "xml") fileInput = document.getElementById('fileInputLeft');
    if (paneTypeXorJ === "json") fileInput = document.getElementById('fileInputRight');
    fileInput.click();
  };


  const handleFileChange = (event, paneTypeXorJ) => {
    const fileInput = event.target;
    const file = fileInput.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target.result;
        if (paneTypeXorJ === "xml") {
          //dont do anything
        }
        setLeftSidePayload(fileContent);
        // if (paneTypeXorJ === "xml") (leftPane == 'json') ? setRightSidePayload(fileContent) : setLeftSidePayload(fileContent);
        // if (paneTypeXorJ === "json") (leftPane == 'xml') ? setRightSidePayload(fileContent) : setLeftSidePayload(fileContent);
        setDropdownOpen(false);
      };

      reader.readAsText(file);
    }
  };

  const handleDownload = () => {
    // logic to download the file here
    let blob;
    const paneTypeXorJ="text";
    if (paneTypeXorJ === "xml") blob = new Blob([leftSidePayload], { type: 'application/xml' });
    if (paneTypeXorJ === "json") blob = new Blob([rightSidePayload], { type: 'application/json' });
    if (paneTypeXorJ === "text") blob = new Blob([rightSidePayload], { type: 'application/text' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    if (paneTypeXorJ === "xml") a.download = 'Converted-payload.xml';
    if (paneTypeXorJ === "json") a.download = 'Converted-payload.json';
    if (paneTypeXorJ === "text") a.download = 'Converted-payload.text';
    a.click();
    window.URL.revokeObjectURL(url);
    setDropdownOpen(false);
  };

  // const handleResizeWindow = () => {
  //   // Implement the logic to resize the window here
  //   // For example, you can set the window width to half of the current width
  //   const newWidth = window.innerWidth / 2;
  //   window.resizeTo(newWidth, window.innerHeight);
  //   setDropdownOpen(false); // Close the dropdown
  // };

  // const handleResizeWindow = () => {
  //   // Implement the logic to resize the panes here
  //   const newWidth = window.innerWidth / 2;
  //   setPaneWidth(newWidth); // Use state to manage the width of the panes

  //   setDropdownOpen(false); // Close the dropdown
  // };

  const doNothing = () => { }

  const handleSampleText = () => {
    // Implement the logic to generate or fetch a sample JSON here
    const sampleText = CONSTANTS.sampleTextData;
    setLeftSidePayload(sampleText);
    setDropdownOpen(false);
  }
  // -----------JSON ToolBar functionalities-----------

  const handleBeautifyJson = () => {
    try {
      const beautifiedJson = JSON.stringify(JSON.parse(rightSidePayload), null, 2);
      setRightSidePayload(beautifiedJson);
      setDropdownOpen(false);
    } catch (error) {
      console.error('Error beautifying JSON:', error);
      setErrorMessages([{ type: 'warning', message: 'Failed to beautify JSON' }]);
      setTimeout(() => {
        setErrorMessages([]);
      }, 2500);
    }
  };

  const handleMinifyJson = () => {
    try {
      const minifiedJson = JSON.stringify(JSON.parse(rightSidePayload));
      setRightSidePayload(minifiedJson);
      setDropdownOpen(false);
    } catch (error) {
      console.error('Error minifying JSON:', error);
      setErrorMessages([{ type: 'warning', message: 'Failed to minify JSON' }]);
      setTimeout(() => {
        setErrorMessages([]);
      }, 2500);
    }
  };

  const handleSortJsonKeys = () => {
    // Implement the logic to sort JSON keys alphabetically
    try {
      const parsedJson = JSON.parse(rightSidePayload);
      const sortedJson = sortObjectKeys(parsedJson);
      const jsonString = JSON.stringify(sortedJson, null, 2);
      setRightSidePayload(jsonString);
      setDropdownOpen(false);
    } catch (error) {
      console.error('Error sorting JSON keys:', error);
      handleApiError(setErrorMessages, 'Failed to sort JSON keys. Please check your JSON and try again.');
    }
  };

  // Function to sort object keys alphabetically
  const sortObjectKeys = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => sortObjectKeys(item));
    }

    return Object.keys(obj)
      .sort()
      .reduce((sortedObj, key) => {
        sortedObj[key] = sortObjectKeys(obj[key]);
        return sortedObj;
      }, {});
  };

  const handleValidJSON = () => {
    setDropdownOpen(false);
    try {
      JSON.parse(rightSidePayload);
      setErrorMessages([{ type: 'success', message: 'Valid JSON Provided!' }]);
      setTimeout(() => {
        setErrorMessages([]);
      }, 2500);
    } catch (error) {
      console.error('Invalid JSON:', error);
      setErrorMessages([{ type: 'warning', message: 'Invalid JSON Provided!' }]);
      setTimeout(() => {
        setErrorMessages([]);
      }, 2500);
    }
  };

  const handleSampleJson = () => {
    // Implement the logic to generate or fetch a sample JSON here
    const sampleJson = CONSTANTS.sampleJsonData;
    setRightSidePayload(sampleJson);
    setDropdownOpen(false);
  };

  const handleCopyJson = () => {
    // Implement the logic to copy the XML to the clipboard here
    navigator.clipboard.writeText(rightSidePayload).then(() => {
      setErrorMessages([{ type: 'info', message: 'Copied to Clipboard' }]);
      setTimeout(() => {
        setErrorMessages([]);
      }, 2500);
    }).catch((error) => {
      console.error('Error copying JSON:', error);
      setErrorMessages([{ type: 'warning', message: 'Failed to copy JSON' }]);
      setTimeout(() => {
        setErrorMessages([]);
      }, 2500);
    });
    setDropdownOpen(false);
  };

  const handleClearJson = () => {
    setRightSidePayload('');
    setDropdownOpen(false);
    setErrorMessages([]);
  };

  const xmlToolbarConfig = {
    formatPayload: handleBeautifyXml,
    minifyPayload: handleMinifyXml,
    sortPayload: handleSortXmlKeys,
    validatePayload: handleValidXml,
    samplePayload: handleSampleXml,
    // openFile:
    downloadPayload: handleDownload,
    copyPayload: handleCopyXml,
    clearPayload: handleClearXml,
    hidden: false
  };
  const jsonToolbarConfig = {
    formatPayload: handleBeautifyJson,
    minifyPayload: handleMinifyJson,
    sortPayload: handleSortJsonKeys,
    validatePayload: handleValidJSON,
    samplePayload: handleSampleJson,
    downloadPayload: handleDownload,
    copyPayload: handleCopyJson,
    clearPayload: handleClearJson,
    hidden: false
  };
  const textToolbarConfig = {
    formatPayload: doNothing,
    minifyPayload: doNothing,
    sortPayload: doNothing,
    validatePayload: doNothing,
    samplePayload: handleSampleText,
    // openFile:
    downloadPayload: handleDownload,
    copyPayload: handleCopyJson,
    clearPayload: handleClearJson,
    hidden: false
  };

  const control = {
    setErrorMessages: setErrorMessages,
    errorMessages:errorMessages,
    setLeftSidePayload:setLeftSidePayload,
    leftSidePayload:leftSidePayload,
    rightSidePayload:rightSidePayload,
    setRightSidePayload:setRightSidePayload,
    toggleDropdown:toggleDropdown,
    isDropdownOpen:isDropdownOpen,
    setDropdownOpen:setDropdownOpen,
    handleClearAll:handleClearAll,
    handleOpenFile:handleOpenFile,
    handleFileChange:handleFileChange,
  };

  const paneConfigDataDefault = {
    // Config data for the default path "/"
    converterType: "XML to JSON",
    leftPane: "xml",
    rightPane: "json",
    converterUri :'/xmltojson',
    contentType:'application/xml',
    leftPaneTitle:"Xml",
    rightPaneTitle:"Json",
    toolbarConfigLeftPane: xmlToolbarConfig,
    toolbarConfigRightPane: jsonToolbarConfig,
    control: { ...control },
  };

  const paneConfigDataXmlToJson = {
    // Config data for "/xmltojson" path
    converterType: "XML to JSON",
    leftPane: "xml",
    rightPane: "json",
    converterUri :'/xmltojson',
    contentType:'application/xml',
    leftPaneTitle:"Xml",
    rightPaneTitle:"Json",
    toolbarConfigLeftPane: xmlToolbarConfig,
    toolbarConfigRightPane: jsonToolbarConfig,
    control: { ...control },
  };

  const paneConfigDataJsonToXml = {
    // Config data for "/jsontoxml" path
    converterType: "JSON to XML",
    leftPane: "json",
    rightPane: "xml",
    converterUri :'/jsontoxml',
    contentType:'application/json',
    leftPaneTitle:"Json",
    rightPaneTitle:"Xml",
    toolbarConfigLeftPane: jsonToolbarConfig,
    toolbarConfigRightPane: xmlToolbarConfig,
    control: { ...control },
  };

  const paneConfigDataXsl = {
    // Config data for "/xsl" path
    converterType: "XSL for Transformation",
    leftPane: "text",
    rightPane: "xml",
    converterUri :'/xsl',
    contentType:'application/text',
    leftPaneTitle:"Input",
    rightPaneTitle:"Output",
    toolbarConfigLeftPane: textToolbarConfig,
    toolbarConfigRightPane: xmlToolbarConfig,
    control: { ...control },
  };

  const paneConfigDataContracts = {
    // Config data for "/contractsconverter" path
    converterType: "Contracts Converter",
    leftPane: "xml",
    rightPane: "json",
    converterUri :'',
    contentType:'application/xml',
    leftPaneTitle:"Xml",
    rightPaneTitle:"Json",
    toolbarConfigLeftPane: xmlToolbarConfig,
    toolbarConfigRightPane: jsonToolbarConfig,
    control: { ...control },
  };

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route
            exact
            path="/"
            element={<Converter paneConfigData={paneConfigDataDefault} />}
          />
          <Route
            exact
            path="/xml-to-json"
            element={<Converter paneConfigData={paneConfigDataXmlToJson} />}
          />
          <Route
            exact
            path="/json-to-xml"
            element={<Converter paneConfigData={paneConfigDataJsonToXml} />}
          />
          <Route
            exact
            path="/xsl-for-transformation"
            element={<Converter paneConfigData={paneConfigDataXsl} />}
          />
          <Route
            exact
            path="/xml-to-contracts"
            element={<Converter paneConfigData={paneConfigDataContracts} />}
          />
          <Route
           element={<Converter paneConfigData={paneConfigDataDefault} />}
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
