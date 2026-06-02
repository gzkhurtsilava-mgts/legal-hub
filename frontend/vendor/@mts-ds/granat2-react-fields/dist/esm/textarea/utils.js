const BORDER_SIZE_WIDTH = 1;
const useAutoresizeTextarea = ({
  ref,
  enabled = true
}) => {
  const onAutoResizeTextarea = () => {
    const textarea = ref?.current;
    if (!textarea || !enabled) {
      return;
    }
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight + BORDER_SIZE_WIDTH * 2}px`;
  };
  return {
    onAutoResizeTextarea
  };
};

export { useAutoresizeTextarea };
