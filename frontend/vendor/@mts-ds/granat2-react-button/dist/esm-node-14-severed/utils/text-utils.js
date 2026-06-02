const getTextColor = ({
  disabled = false,
  variant = 'primary'
}) => {
  if (disabled) return 'text-tertiary';
  switch (variant) {
    case 'primary-alternative':
      return 'text-inverted';
    case 'secondary':
    case 'ghost':
      return 'text-primary';
    case 'always-white':
      return 'constant-greyscale-800';
    case 'blur':
      return 'constant-greyscale-0';
    case 'negative':
      return 'text-negative';
    default:
      return 'constant-greyscale-0';
  }
};
const getTextFont = ({
  size = 44
}) => {
  switch (size) {
    case 32:
      return 'c2-bold-upp-wide';
    case 52:
      return 'c1-bold-upp-wide';
    case 72:
      return 'p4-bold-upp-wide';
    default:
      return 'c1-bold-upp-wide';
  }
};

export { getTextColor, getTextFont };
