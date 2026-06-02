'use client';
import * as React from 'react';
import cn from 'clsx';
import styles from './breadcrumb.module.scss.js';
import { useBreadcrumbIcon } from './hooks/use-breadcrumb-icon.js';

const BreadcrumbItem = function BreadcrumbItem(props) {
  const {
    href,
    onClick,
    children,
    active,
    metaContent,
    size,
    oneLine,
    className,
    ...rest
  } = props;
  const breadcrumbIcon = useBreadcrumbIcon({
    size,
    oneLine
  });
  return /*#__PURE__*/React.createElement("li", {
    ...rest,
    className: cn(className, styles['mtsds-breadcrumb__item'], active && styles['mtsds-breadcrumb__item--current']),
    itemProp: "itemListElement",
    itemScope: true,
    itemType: "https://schema.org/ListItem"
  }, /*#__PURE__*/React.createElement("a", {
    className: cn(styles['mtsds-breadcrumb__item-link']),
    href: href,
    onClick: () => onClick?.(),
    itemProp: "item"
  }, oneLine && breadcrumbIcon, /*#__PURE__*/React.createElement("span", {
    className: cn(styles['mtsds-breadcrumb__item-link-text']),
    itemProp: "name"
  }, children), !active && !oneLine && breadcrumbIcon), /*#__PURE__*/React.createElement("meta", {
    itemProp: "position",
    content: metaContent
  }));
};

export { BreadcrumbItem };
