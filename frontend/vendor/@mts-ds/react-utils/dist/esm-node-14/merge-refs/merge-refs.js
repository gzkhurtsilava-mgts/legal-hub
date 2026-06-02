function mergeRefs(...refs) {
  return node => {
    refs.forEach(ref => {
      if (!ref) return;
      if (typeof ref === 'function') {
        ref(node);
      } else {
        // eslint-disable-next-line no-param-reassign
        ref.current = node;
      }
    });
  };
}

export { mergeRefs };
