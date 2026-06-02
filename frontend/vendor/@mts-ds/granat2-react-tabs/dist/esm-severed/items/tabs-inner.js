import * as React from 'react';
import { forwardRef, useContext, useMemo } from 'react';
import clsx from 'clsx';
import { IndicatorContext } from '../context/indicator.js';
import styles from '../tabs.module.scss.js';

const TabsInner = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    children,
    accent,
    className,
    style,
    ...rest
  } = props;
  const {
    offset,
    type,
    size
  } = useContext(IndicatorContext);
  const blockStyles = clsx((accent || type === 'button') && styles['mtsds-tabs--accent'], styles['mtsds-tabs'], size && styles[`mtsds-tabs--size--${size}`], type && styles[`mtsds-tabs--type--${type}`]);
  const indicatorPositionVariable = useMemo(() => ({
    '--mtsds-tabs--background-position': `${offset.left}px`,
    '--mtsds-tabs--background-width': `${offset.width}px`,
    ...style
  }), [offset, style]);
  return (
    /*#__PURE__*/
    // eslint-disable-next-line react/jsx-props-no-spreading
    React.createElement("ul", {
      ...rest,
      ref: ref,
      className: clsx(blockStyles, className),
      style: indicatorPositionVariable
    }, children, /*#__PURE__*/React.createElement("div", {
      className: styles['mtsds-tabs__indicator']
    }))
  );
});

export { TabsInner };
