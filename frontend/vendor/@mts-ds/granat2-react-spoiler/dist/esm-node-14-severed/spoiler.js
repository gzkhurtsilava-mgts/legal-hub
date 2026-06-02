import * as React from 'react';
import { forwardRef, useState } from 'react';
import cn from 'clsx';
import SvgArrow from './granat2/src/components/spoiler/assets/arrow.svg.js';
import styles from './spoiler.module.scss.js';

const Spoiler = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    label,
    variant = 'primary',
    active,
    defaultActive,
    disabled = false,
    children,
    onToggle,
    className,
    ...rest
  } = props;
  const [internalActive, setInternalActive] = useState(typeof defaultActive !== 'undefined' && defaultActive);
  const onToggleHandler = () => {
    if (typeof defaultActive !== 'undefined') setInternalActive(prevState => !prevState);
    onToggle?.();
  };
  const blockStyles = cn(className, styles['mtsds-spoiler'], !!variant && styles[`mtsds-spoiler--${variant}`], (typeof active !== 'undefined' ? active : internalActive) && styles[`mtsds-spoiler--active`], disabled && styles[`mtsds-spoiler--disabled`]);
  return (
    /*#__PURE__*/
    // eslint-disable-next-line react/jsx-props-no-spreading
    React.createElement("div", {
      ...rest,
      ref: ref,
      className: blockStyles
    }, /*#__PURE__*/React.createElement("button", {
      className: styles['mtsds-spoiler__button'],
      type: "button",
      onClick: onToggleHandler
    }, /*#__PURE__*/React.createElement("p", {
      className: styles['mtsds-spoiler__text']
    }, label), /*#__PURE__*/React.createElement("div", {
      className: styles['mtsds-spoiler__icon']
    }, /*#__PURE__*/React.createElement(SvgArrow, {
      className: cn(styles['mtsds-svg'], styles['mtsds-icon'])
    }))), /*#__PURE__*/React.createElement("div", {
      className: styles['mtsds-spoiler__content']
    }, /*#__PURE__*/React.createElement("div", {
      className: styles['mtsds-spoiler__content-inner']
    }, children)))
  );
});

export { Spoiler };
