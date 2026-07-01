import * as React from 'react';

export interface Step { label: string; description?: string; }

export interface StepsProps {
  steps: Array<Step | string>;
  current?: number;
  style?: React.CSSProperties;
}

export declare function Steps(props: StepsProps): JSX.Element;
export default Steps;
