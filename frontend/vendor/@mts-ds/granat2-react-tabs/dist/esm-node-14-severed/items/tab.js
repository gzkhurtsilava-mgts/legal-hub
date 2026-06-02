import * as React from 'react';
import { forwardRef, useContext, useRef, useState, useCallback, useEffect } from 'react';
import clsx from 'clsx';
import SvgArrowTriangle from '../granat2/src/components/tabs/assets/arrow-triangle.svg.js';
import { useEventListener } from '@mts-ds/react-utils';
import styles from '../tabs.module.scss.js';
import { IndicatorContext } from '../context/indicator.js';

const Tab = /*#__PURE__*/forwardRef(props => {
  const {
    id,
    text,
    onClick,
    children,
    withArrow,
    className,
    ...rest
  } = props;
  const {
    setOffset,
    size,
    type,
    activeTab,
    setActiveTab
  } = useContext(IndicatorContext);
  const ref = useRef(null);
  const [elOffset, setElOffset] = useState({
    width: 0,
    left: 0
  });
  const handleSize = useCallback(() => {
    setElOffset({
      width: ref?.current?.offsetWidth || 0,
      left: ref?.current?.offsetLeft || 0
    });
  }, [ref?.current?.offsetLeft, ref?.current?.offsetWidth]);
  useEventListener('resize', handleSize);
  const handleClick = () => {
    setActiveTab(id);
    if (onClick) onClick();
  };
  useEffect(() => {
    if (id === activeTab) {
      handleSize();
    }
  }, [activeTab]);
  useEffect(() => {
    if (id === activeTab) {
      setOffset(elOffset);
    }
  }, [elOffset]);
  useEffect(() => {
    handleSize();
  }, [size, type]);
  const blockStyles = clsx(styles['mtsds-tabs__item'], id === activeTab && [styles['mtsds-tabs__item--active'], type === 'stroke' && styles['mtsds-tabs__item--open']]);
  return (
    /*#__PURE__*/
    // eslint-disable-next-line react/jsx-props-no-spreading
    React.createElement("li", {
      ...rest,
      ref: ref,
      className: clsx(blockStyles, className)
    }, /*#__PURE__*/React.createElement("button", {
      className: styles['mtsds-tabs__tab'],
      type: "button",
      onClick: handleClick
    }, /*#__PURE__*/React.createElement("p", {
      className: styles['mtsds-tabs__tab-name']
    }, text), children && /*#__PURE__*/React.createElement("div", {
      className: styles['mtsds-tabs__tab-counter']
    }, children), !children && withArrow && type !== 'button' && /*#__PURE__*/React.createElement("div", {
      className: styles['mtsds-tabs__tab-icon'],
      "aria-hidden": true
    }, /*#__PURE__*/React.createElement(SvgArrowTriangle, null))))
  );
});

export { Tab };
