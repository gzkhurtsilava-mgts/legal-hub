import * as React from 'react';

var _path;
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
var SvgArrowTriangle = function SvgArrowTriangle(props) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 16 16"
  }, props), _path || (_path = /*#__PURE__*/React.createElement("path", {
    d: "M6.2 8.998C7.002 10.338 7.404 11 8 11c.594 0 .997-.661 1.8-2.002l.164-.272c.725-1.209 1.088-1.813.83-2.27C10.533 6 9.83 6 8.42 6h-.842c-1.41 0-2.114 0-2.373.457-.258.456.105 1.06.83 2.269z"
  })));
};

export { SvgArrowTriangle as default };
