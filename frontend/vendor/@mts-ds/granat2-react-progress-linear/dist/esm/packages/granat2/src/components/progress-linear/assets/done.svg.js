import * as React from 'react';

var _path;
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
var SvgDone = function SvgDone(props) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none"
  }, props), _path || (_path = /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    d: "M4.686 4.686c-1.313 1.313-1.41 2.62-1.605 5.237C3.03 10.6 3 11.3 3 12s.03 1.399.08 2.077c.196 2.616.293 3.924 1.606 5.237s2.62 1.41 5.237 1.605C10.6 20.969 11.3 21 12 21s1.399-.03 2.077-.081c2.616-.195 3.924-.292 5.237-1.605s1.41-2.62 1.605-5.237c.05-.678.08-1.377.08-2.077s-.03-1.399-.08-2.077c-.195-2.616-.292-3.924-1.605-5.237s-2.621-1.41-5.237-1.605A28 28 0 0 0 12 3c-.7 0-1.4.03-2.077.081-2.616.195-3.924.292-5.237 1.605m11.52 5.521a1 1 0 0 0-1.413-1.414L11 12.586l-1.293-1.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0z"
  })));
};

export { SvgDone as default };
