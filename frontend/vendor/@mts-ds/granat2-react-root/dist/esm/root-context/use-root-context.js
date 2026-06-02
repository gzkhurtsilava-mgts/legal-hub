import { useContext } from 'react';
import { RootContext } from './root-context.js';

/**
 * @internal
 */
function useRootContext() {
  const context = useContext(RootContext);
  if (context === undefined) {
    throw new Error('useRootContext must be used within a RootContextProvider');
  }
  return context;
}

export { useRootContext };
