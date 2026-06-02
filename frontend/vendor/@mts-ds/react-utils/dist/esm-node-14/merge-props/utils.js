const mergeCss = (a, b) => a && b ? {
  ...a,
  ...b
} : a || b;
const mergeEvents = (...rawFunctions) => (...args) => {
  rawFunctions.forEach(fn => {
    fn?.(...args);
  });
};

export { mergeCss, mergeEvents };
