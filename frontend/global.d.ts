declare module '*.css';

// @mts-ds компоненты собраны под React 17, где ReactPortal.children не обязателен.
// В @types/react 18.3+ children стало required в ReactPortal, что ломает совместимость.
import 'react';
declare module 'react' {
  interface ReactPortal {
    children?: ReactNode;
  }
}
