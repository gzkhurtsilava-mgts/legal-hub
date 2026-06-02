import * as React from 'react';

var _path;
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
var SvgCross = function SvgCross(props) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, props), _path || (_path = /*#__PURE__*/React.createElement("path", {
    d: "M6.3 16.3a1 1 0 1 0 1.4 1.4l4.3-4.29 4.3 4.3a1 1 0 0 0 1.4-1.42L13.42 12l4.3-4.3a1 1 0 0 0-1.42-1.4L12 10.58l-4.3-4.3a1 1 0 0 0-1.4 1.42L10.58 12l-4.3 4.3Z"
  })));
};

export { SvgCross as default };
