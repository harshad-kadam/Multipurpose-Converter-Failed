import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import axios from 'axios';
import { FaFile, FaDownload, FaTrash, FaCopy, FaFileAlt } from 'react-icons/fa';
import { MdDriveFolderUpload, MdFormatIndentIncrease } from "react-icons/md";
import { CgFormatLeft } from "react-icons/cg";
import { TbSortAscendingLetters } from "react-icons/tb";
import { LiaCheckCircle } from "react-icons/lia";
import { BsFiletypeXml, BsFiletypeJson, BsTrash3 } from "react-icons/bs";
import { SiConvertio } from "react-icons/si";
import { VscJson, VscCode } from "react-icons/vsc";

import XmlEditor from '../../Components/XmlEditor/XmlEditor';
import JsonEditor from '../../Components/JsonEditor/JsonEditor';
import TooltipWrapper from '../../Components/Tooltip/TooltipWrapper';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import '../../App.css';
import '../../ResponsiveStyles.css';
import './EditorToolbar.css';
import { handleApiError, handleUncaughtError } from '../../Utils/errorHandling';

import 'bootstrap/dist/css/bootstrap.min.css';

const CONSTANTS = require('../../Config/Constants');

const Converter = ({ converterType, leftPane, rightPane, converterUri, contentType, leftPaneTitle, rightPaneTitle, toolbarConfigLeftPane, toolbarConfigRightPane ,control}) => {
  const [loading, setLoading] = useState(false);
  const handleRouteNavigation = useNavigate();

  const bottomRef = useRef(null);

  useEffect(() => {
    // Set up global error handler for uncaught runtime errors
    window.onerror = (message, source, lineno, colno, error) => {
      handleUncaughtError(control.setErrorMessages, error);
      return true;
    };

    // Clean up the global error handler when the component is unmounted
    return () => {
      window.onerror = null;
    };
  }, []);

  const handleConvert = async (e) => {
    try {
      setLoading(true);
      e.preventDefault();
      console.log('API_URL:', CONSTANTS.REACT_APP_API_URL);
      let reqPayload = (leftPane == 'json') ? control.rightSidePayload : control.leftSidePayload;
      const response = await axios.post(`${CONSTANTS.REACT_APP_API_URL}` + converterUri, reqPayload, {
        // const response = await axios.post('https://apis-dev.globalpay.com/v1/boarding/propay', control.leftSidePayload, {
        mode: 'no-cors',
        // method: 'POST',
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*'
        },
        timeout: 15000, // 15 seconds timeout
      });

      const data = response.data;

      if (leftPane == 'xml') {
        //based on request content-type req xml type then res json type & vice versa
        if (contentType == 'application/xml') {
          control.setRightSidePayload(JSON.stringify(data, null, 2));
        } else {
          control.setRightSidePayload(data);
        }
      } else if (leftPane == 'json') {
        if (contentType == 'application/xml') {
          control.setLeftSidePayload(JSON.stringify(data, null, 2));
        } else {
          control.setLeftSidePayload(data);
        }
      } else if (leftPane == 'text' && rightPane == 'text') {
        control.setRightSidePayload(data);
      } else {
        control.setRightSidePayload(data);
      }


      control.setErrorMessages([{ type: 'success', message: 'Conversion successful' }]);
      setTimeout(() => {
        control.setErrorMessages([]);
      }, 2500);
    } catch (error) {
      console.error('Error converting payload:', error);

      if (axios.isCancel(error)) {
        // Request was canceled due to timeout
        handleApiError(control.setErrorMessages, 'Request timed out. Please check your internet connection and try again.');
      } else if (error.response) {
        // The request was made, but the server responded with a status code
        const statusCode = error.response.status;
        switch (statusCode) {
          case 400:
            handleApiError(control.setErrorMessages, 'Bad request. Please check your input and try again.');
            break;
          case 401:
            handleApiError(control.setErrorMessages, 'Unauthorized. Please check your credentials and try again.');
            break;
          case 404:
            handleApiError(control.setErrorMessages, 'Resource Not Found. Please Retry.');
            break;
          default:
            handleApiError(control.setErrorMessages, `Failed with status code ${statusCode}. Please try again later.`);
        }
      } else {
        // Something happened in setting up the request that triggered an error
        if (error.message === 'timeout of 15000ms exceeded') {
          handleApiError(control.setErrorMessages, 'Request timed out. Please check your internet connection and try again.');
        } else if (error.code === 'ECONNABORTED') {
          // The request was made but no response was received
          handleApiError(control.setErrorMessages, 'Request timed out. Please check your internet connection and try again.');
        } else if (error.request) {
          // The request was made but no response was received
          handleApiError(control.setErrorMessages, 'No response from the server. Please try again later.');
        } else {
          handleApiError(control.setErrorMessages, 'An unexpected error occurred. Please try again later.');
        }
      }
    } finally {
      setLoading(false);
      // Scroll to the bottom of the page
      // window.scrollTo(0, document.body.scrollHeight);
      // window.scrollTo(0, document.documentElement.scrollHeight);

      // Scroll to the bottom of the page
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };
  return (
    <div className="app-container">
      <Header />
      <div className="editor-buttons">
        <div className={`dropdown ${control.isDropdownOpen ? 'open' : ''}`}>
          <div>
            <div
              onClick={(e) => {
                e.preventDefault();
                control.toggleDropdown();
              }}
              className="cog-button"
            >
              <TooltipWrapper icon={<SiConvertio className={`cog-icon ${control.isDropdownOpen ? 'rotate' : ''}`} />} text="-- select converter --" />
            </div>
            <div className="dropdown-content">
              <TooltipWrapper icon={<BsFiletypeXml />} action={() => handleRouteNavigation('/xml-to-json')} text="XML to JSON" />
              <TooltipWrapper icon={<BsFiletypeJson />} action={() => handleRouteNavigation('/json-to-xml')} text="JSON to XML" />
              <TooltipWrapper icon={<VscJson />} action={() => handleRouteNavigation('/xml-to-contracts')} text="XML to SnakeCase Json" />
              <TooltipWrapper icon={<VscCode />} action={() => handleRouteNavigation('/xsl-for-transformation')} text="Get XSL script for Input" />
              <TooltipWrapper icon={<BsTrash3 />} action={control.handleClearAll} text="Clear All" />
            </div>
          </div>
        </div>
      </div>
      <div className="buttons-container">
        {loading ? <p>Processing...</p> : (
          <>
            <div onClick={handleConvert}>{converterType}</div>
          </>
        )}
        {control.errorMessages.length > 0 &&
          control.errorMessages.map((error, index) => (
            <Alert key={index} variant={error.type}>
              {error.message}
            </Alert>
          ))}
      </div>
      <div className="editors-container is-fluid">
        {/* XmlEditor */}
        <div className="xml-editor-pane columns mb-0 is-desktop">
          {/*Toolbar */}
          <div className="editor-toolbar">
            <div title="Format Payload" onClick={() => toolbarConfigLeftPane.formatPayload()} style={{ fontSize: '22px' }}><MdFormatIndentIncrease /></div>
            <div title="Minify Payload" onClick={() => toolbarConfigLeftPane.minifyPayload()} style={{ fontSize: '24px' }}><CgFormatLeft /></div>
            <div title="Sort Payload" onClick={() => toolbarConfigLeftPane.sortPayload()} style={{ fontSize: '22px' }}><TbSortAscendingLetters /></div>
            <div title="Validate Payload" onClick={() => toolbarConfigLeftPane.validatePayload()} style={{ fontSize: '22px' }}><LiaCheckCircle /></div>
            <div className="icon is-hidden-desktop-only is-hidden-mobile" style={{ marginRight: '30px', float: 'right' }}>
              <i>{leftPaneTitle} Pane</i>
            </div>
            <div title="Sample Payload" onClick={() => toolbarConfigLeftPane.samplePayload()}><FaFile /></div>
            <div title="Open File" onClick={(e) => control.handleOpenFile(e, 'xml')} style={{ fontSize: '24px' }}>
              <MdDriveFolderUpload />
              <input
                type="file"
                id="fileInputLeft"
                onChange={(e) => control.handleFileChange(e, 'xml')}
                style={{ display: 'none' }}
              />
            </div>
            <div title="Download Payload" onClick={() => toolbarConfigLeftPane.downloadPayload()}><FaDownload /></div>
            <div title="Copy Payload" onClick={() => toolbarConfigLeftPane.copyPayload()}><FaCopy /></div>
            <div title="Clear Payload" onClick={() => toolbarConfigLeftPane.clearPayload()}><FaTrash /></div>
            {/* <div title="Resize Window" onClick={handleCopyXml}><FaArrowsAlt FaCompress/></div> */}
          </div>
          <XmlEditor xml={(leftPane === 'xml') ? control.leftSidePayload : (leftPane === 'json') ? control.rightSidePayload : control.leftSidePayload} payloadType={leftPane} />
        </div>
        <div className="buttons-container-inner">
          {loading ? <p>Processing...</p> : (
            <>
              <div onClick={handleConvert}>{converterType}</div>
            </>
          )}
          {control.errorMessages.length > 0 &&
            control.errorMessages.map((error, index) => (
              <Alert key={index} variant={error.type}>
                {error.message}
              </Alert>
            ))}
        </div>
        {/* JsonEditor */}
        <div className="json-editor-pane columns mb-0 is-desktop">
          {/*Toolbar */}
          <div className="editor-toolbar">
            <div title="Format Payload" onClick={() => toolbarConfigRightPane.formatPayload()} style={{ fontSize: '22px' }}><MdFormatIndentIncrease /></div>
            <div title="Minify Payload" onClick={() => toolbarConfigRightPane.minifyPayload()} style={{ fontSize: '24px' }}><CgFormatLeft /></div>
            <div title="Sort Payload" onClick={() => toolbarConfigRightPane.sortPayload()} style={{ fontSize: '22px' }}><TbSortAscendingLetters /></div>
            <div title="Validate Payload" onClick={() => toolbarConfigRightPane.validatePayload()} style={{ fontSize: '22px' }}><LiaCheckCircle /></div>
            <div className="icon is-hidden-desktop-only is-hidden-mobile" style={{ marginRight: '30px', float: 'right' }}>
              <i>{rightPaneTitle} Pane</i>
            </div>
            <div title="Sample Payload" onClick={() => toolbarConfigRightPane.samplePayload()}><FaFileAlt /></div>
            <div title="Open File" onClick={(e) => control.handleOpenFile(e, 'json')} style={{ fontSize: '24px' }}>
              <MdDriveFolderUpload />
              <input
                type="file"
                id="fileInputRight"
                onChange={(e) => control.handleFileChange(e, 'json')}
                style={{ display: 'none' }}
              />
            </div>
            <div title="Download Payload" onClick={() => toolbarConfigRightPane.downloadPayload()}><FaDownload /></div>
            <div title="Copy Payload" onClick={() => toolbarConfigRightPane.copyPayload()}><FaCopy /></div>
            <div title="Clear Payload" onClick={() => toolbarConfigRightPane.clearPayload()}><FaTrash /></div>
            {/* <div title="Resize Window" onClick={handleBeautifyXml}><FaArrowsAlt FaCompress/></div> */}
          </div>
          <JsonEditor json={(rightPane === 'xml') ? control.leftSidePayload : (rightPane === 'json') ? control.rightSidePayload : control.rightSidePayload} payloadType={rightPane} />
        </div>
      </div>
      <Footer />
      <div ref={bottomRef}></div>
    </div>
  );
};

export default Converter;
