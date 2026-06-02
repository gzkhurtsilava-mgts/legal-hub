import cn from 'clsx';
import styles from '../text.module.scss.js';

const useTextClass = ({
  font = 'c2-bold-upp-wide',
  truncate = false,
  className = ''
}) => cn(className, styles['mtsds-text'], styles[`mtsds-text--font--${font}`], truncate && styles[`mtsds-text--truncate`]);

export { useTextClass };
