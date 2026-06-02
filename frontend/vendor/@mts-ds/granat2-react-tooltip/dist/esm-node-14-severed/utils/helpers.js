function shiftPopper(heightTarget, widthTarget, position, element) {
  if (!element) {
    return;
  }
  const centerWidthTarget = widthTarget / 2;
  const centerHeightTarget = heightTarget / 2;
  const indent = 20; // px
  const htmlElement = element;
  switch (position) {
    case 'top-start':
    case 'bottom-start':
      {
        htmlElement.style.margin = `0 0 0 ${centerWidthTarget - indent}px`;
        break;
      }
    case 'top-end':
    case 'bottom-end':
      {
        htmlElement.style.margin = `0 0 0 -${centerWidthTarget - indent}px`;
        break;
      }
    case 'left-start':
    case 'right-start':
      {
        htmlElement.style.margin = `${centerHeightTarget - indent}px 0 0 0`;
        break;
      }
    case 'left-end':
    case 'right-end':
      {
        htmlElement.style.margin = `0 0 ${centerHeightTarget - indent}px 0`;
        break;
      }
    default:
      {
        htmlElement.style.margin = '0 0 0 0';
        break;
      }
  }
}
function placementDecorator(placements) {
  const res = [];
  placements.forEach(placement => {
    switch (placement) {
      case 'top':
        {
          res.push(placement, 'top-start', 'top-end');
          break;
        }
      case 'bottom':
        {
          res.push(placement, 'bottom-start', 'bottom-end');
          break;
        }
      case 'left':
        {
          res.push(placement, 'left-start', 'left-end');
          break;
        }
      case 'right':
        {
          res.push(placement, 'right-start', 'right-end');
          break;
        }
    }
  });
  return res;
}

export { placementDecorator, shiftPopper };
