import { clsx } from './../ext/clsx/dist/clsx.m.js';
import { mergeCss, mergeEvents } from './utils.js';

const isEventHandler = value => typeof value === 'function';
const isStyle = value => typeof value === 'object' && value !== null;
const isClassValue = value => typeof value === 'string' || Array.isArray(value) || typeof value === 'object' && value !== null;
const mergeValue = (key, prev, next) => {
  if (key === 'style' && isStyle(prev) && isStyle(next)) {
    return mergeCss(prev, next);
  }
  if (key === 'className' && isClassValue(prev) && isClassValue(next)) {
    return clsx(prev, next);
  }
  if (typeof key === 'string' && key.startsWith('on') && isEventHandler(prev) && isEventHandler(next)) {
    return mergeEvents(next, prev);
  }
  return next ?? prev;
};
const mergeSymbols = (target, source) => {
  Object.getOwnPropertySymbols(source).forEach(symbol => {
    // eslint-disable-next-line no-param-reassign
    target[symbol] = source[symbol];
  });
};
const mergeProps = (...args) => {
  const result = {};
  args.forEach(props => {
    if (!props) return;
    Object.keys(props).forEach(key => {
      result[key] = mergeValue(key, result[key], props[key]);
    });
    mergeSymbols(result, props);
  });
  return result;
};

export { mergeProps };
