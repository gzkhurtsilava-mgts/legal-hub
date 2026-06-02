import * as React from 'react';
import { useMemo } from 'react';
import { Spinner } from '@mts-ds/granat2-react-spinner';
import styles from '../base-button/base-button.module.scss.js';

const Loader = function Loader({
  buttonVariant = 'primary',
  buttonSize = 44
}) {
  const spinnerColor = useMemo(() => {
    switch (buttonVariant) {
      case 'primary':
      case 'primary-alternative':
      case 'blur':
        return 'white';
      case 'negative':
        return 'negative';
      default:
        return 'black';
    }
  }, [buttonVariant]);
  return /*#__PURE__*/React.createElement(Spinner, {
    className: styles['mtsds-button__spinner'],
    size: buttonSize === 32 ? 16 : 24,
    color: spinnerColor
  });
};

export { Loader };
