import { useId } from '@mts-ds/react-utils';

const useFieldAria = options => {
  const mtsId = useId() || '';
  const baseId = options.id ?? mtsId;
  const inputId = `${baseId}-input`;
  const labelId = `${baseId}-label`;
  const descriptionId = `${baseId}-description`;
  return {
    labelArea: {
      id: labelId,
      htmlFor: inputId
    },
    fieldArea: {
      'id': inputId,
      'aria-labelledby': labelId,
      'aria-describedby': descriptionId,
      'aria-invalid': options.invalid || undefined,
      'disabled': options.disabled
    },
    descriptionArea: {
      id: descriptionId
    }
  };
};

export { useFieldAria };
