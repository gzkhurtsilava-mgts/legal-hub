function numericValidator({
  numberParts,
  isDecimal,
  country
}) {
  let resultNumberParts;
  let value = numberParts.slice(0, isDecimal ? undefined : 1).join(".");
  const allowedKeys = ["\\d"];
  if (isDecimal) {
    allowedKeys.push("\\.");
  }
  const reInvalidKeys = new RegExp(`[^${allowedKeys.join("|")}]`, "g");
  const invalidChars = value.match(reInvalidKeys);
  let cursorOffset = 0;
  value = value.replace(/\./g, (c, i) => {
    if (value.indexOf(c) === i) {
      return c;
    } else {
      cursorOffset -= 1;
      return "";
    }
  });
  if (invalidChars) {
    value = value.replace(reInvalidKeys, "");
    cursorOffset -= invalidChars.length;
  }
  resultNumberParts = value.split(".");
  return {
    numberParts: resultNumberParts,
    country
  };
}

export { numericValidator };
