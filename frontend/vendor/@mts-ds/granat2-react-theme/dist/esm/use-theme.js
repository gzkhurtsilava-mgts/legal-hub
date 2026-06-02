import { useContext } from 'react';
import { ThemeContext } from './theme-context.js';

function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a Theme');
  }
  return context;
}

export { useTheme };
