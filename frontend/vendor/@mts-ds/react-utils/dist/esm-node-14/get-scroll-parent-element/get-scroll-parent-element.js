function getScrollParentElement(node) {
  if (node == null) {
    return null;
  }
  const {
    overflowY,
    overflow,
    overflowX
  } = getComputedStyle(node);
  const isOverflow = /auto|scroll|overlay|revert/g.test(overflowY + overflowX + overflow);
  if ((node.scrollHeight > node.clientHeight || node.scrollWidth > node.clientWidth) && isOverflow) {
    return node;
  }
  return getScrollParentElement(node.parentElement);
}

export { getScrollParentElement };
