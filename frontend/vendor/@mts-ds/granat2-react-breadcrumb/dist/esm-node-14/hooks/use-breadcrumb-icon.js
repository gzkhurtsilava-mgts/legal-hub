'use client';
import * as React from 'react';
import cn from 'clsx';
import SvgChevronLeft16 from '../packages/granat2/src/components/breadcrumb/assets/chevron-left-16.svg.js';
import SvgChevronLeft24 from '../packages/granat2/src/components/breadcrumb/assets/chevron-left-24.svg.js';
import SvgChevronRight16 from '../packages/granat2/src/components/breadcrumb/assets/chevron-right-16.svg.js';
import SvgChevronRight24 from '../packages/granat2/src/components/breadcrumb/assets/chevron-right-24.svg.js';
import styles from '../breadcrumb.module.scss.js';

const useBreadcrumbIcon = ({
  size = 24,
  oneLine
}) => {
  const iconClass = cn(styles['mtsds-icon'], styles['mtsds-svg']);
  return size === 24 ? !oneLine ? /*#__PURE__*/React.createElement(SvgChevronRight24, {
    className: iconClass
  }) : /*#__PURE__*/React.createElement(SvgChevronLeft24, {
    className: iconClass
  }) : !oneLine ? /*#__PURE__*/React.createElement(SvgChevronRight16, {
    className: iconClass
  }) : /*#__PURE__*/React.createElement(SvgChevronLeft16, {
    className: iconClass
  });
};

export { useBreadcrumbIcon };
