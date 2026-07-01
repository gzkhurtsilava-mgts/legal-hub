import * as React from 'react';

export interface UploadFile { name: string; size?: string; progress?: number; error?: string; }

export interface FileUploadProps {
  files?: UploadFile[];
  onAdd?: (e?: any) => void;
  onRemove?: (index: number) => void;
  label?: string;
  hint?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export declare function FileUpload(props: FileUploadProps): JSX.Element;
export default FileUpload;
