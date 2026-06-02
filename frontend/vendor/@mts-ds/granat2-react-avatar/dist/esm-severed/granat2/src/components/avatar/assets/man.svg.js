import * as React from 'react';

var _path;
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
var SvgMan = function SvgMan(props) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 32 32",
    xmlns: "http://www.w3.org/2000/svg"
  }, props), _path || (_path = /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    d: "M20.28 21.9v1.94c7.43 4.28 11.17 2.14 11.17 11.82H1c0-10.02 3.74-7.54 11.17-11.82v-1.9c-1.31-.93-1.6-2.42-2.04-4.17h-.05c-.2 0-.39-.3-.39-.64 0-.1.05-.1.05-.2-.14-.19-.29-.48-.39-.82-.14-.53-.58-1.6-.19-2.14.39-.34.58.05.58.05-.53-2.82-1.26-6.56 2.67-7.73 0-2.43 9.23-1.36 10.3 2.63.54 1.55-.14 5.05-.14 5.05.14-.24.34-.34.53-.14.53.34-.05 1.8-.2 2.28-.1.44-.24.68-.38.93l.05.1c0 .33-.2.63-.4.63-.24 1.55-.67 3.3-1.89 4.13Z"
  })));
};

export { SvgMan as default };
