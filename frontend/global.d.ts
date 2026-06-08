// Side-effect CSS imports (theme, globals) — TypeScript doesn't resolve these natively
declare module '*.css';

// @mts-ds/granat2-react-root exports theme.css via package exports map;
// TypeScript resolves it to dist/theme.css which has no .d.ts alongside it.
declare module '@mts-ds/granat2-react-root/theme.css';
