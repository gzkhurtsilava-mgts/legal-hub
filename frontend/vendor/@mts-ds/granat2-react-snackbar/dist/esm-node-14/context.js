'use client';
import * as React from 'react';
import { useContext, createContext } from 'react';

const TimeoutContext = /*#__PURE__*/createContext(undefined);
const TimeoutProvider = function TimeoutProvider({
  timeout,
  children
}) {
  return /*#__PURE__*/React.createElement(TimeoutContext.Provider, {
    value: timeout
  }, children);
};
const useTimeout = () => {
  const context = useContext(TimeoutContext);
  if (context === undefined) throw new Error('useTimeout must be used within a TimeoutProvider');
  return context;
};

export { TimeoutProvider, useTimeout };
