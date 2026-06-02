import * as React from 'react';
import { forwardRef, useContext, useMemo } from 'react';
import cn from 'clsx';
import { SegmentedControlContext } from '../context/segmented-context.js';
import styles from '../segmented-control.module.scss.js';

const SegmentedControlGroup = /*#__PURE__*/forwardRef((props, ref) => {
  const {
    fluid = false,
    background = 'primary',
    typography = 'bold',
    children,
    className,
    style,
    ...rest
  } = props;
  const {
    offset,
    size = 44
  } = useContext(SegmentedControlContext);
  const activeControlPosition = useMemo(() => ({
    '--mtsds-segmented-control--highlight-x-pos': `${offset.left}px`,
    '--mtsds-segmented-control--highlight-width': `${offset.width}px`
  }), [offset]);
  return /*#__PURE__*/React.createElement("div", {
    ...rest,
    className: cn(className, styles['mtsds-segmented-control'], styles[`mtsds-segmented-control--size--${size}`], styles[`mtsds-segmented-control--typography--${typography}`], styles[`mtsds-segmented-control--background--${background}`], fluid && styles[`mtsds-segmented-control--fluid`]),
    style: {
      ...style,
      ...activeControlPosition
    },
    ref: ref
  }, /*#__PURE__*/React.createElement("div", {
    className: cn(styles['mtsds-segmented-control__group'])
  }, children));
});

export { SegmentedControlGroup };
