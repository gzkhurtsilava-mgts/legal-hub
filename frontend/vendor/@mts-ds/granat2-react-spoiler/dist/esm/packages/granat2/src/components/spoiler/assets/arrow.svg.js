import * as React from 'react';

var _path;
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
var SvgArrow = function SvgArrow(props) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 16 16"
  }, props), _path || (_path = /*#__PURE__*/React.createElement("path", {
    d: "M3.752 6.164a.75.75 0 0 0-.53 1.28l1.76 1.76c1.421 1.42 2.133 2.131 3.018 2.131s1.596-.71 3.019-2.133l1.76-1.759a.75.75 0 1 0-1.062-1.06l-1.76 1.758c-.74.742-1.193 1.188-1.56 1.469a1.6 1.6 0 0 1-.33.208c-.043.018-.058.017-.066.017h-.002c-.008 0-.023 0-.066-.017a1.6 1.6 0 0 1-.33-.208c-.367-.28-.819-.727-1.56-1.469l-1.76-1.758a.75.75 0 0 0-.53-.22"
  })));
};

export { SvgArrow as default };
