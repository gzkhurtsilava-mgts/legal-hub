function dateValidator({
  numberParts
}) {
  let resultNumberParts;
  let value = numberParts.join(".");
  const allowedKeys = ["\\d", "\\.", "д", "м", "г"];
  const reInvalidKeys = new RegExp(`[^${allowedKeys.join("|")}]`, "g");
  const invalidChars = value.match(reInvalidKeys);
  if (invalidChars) {
    value = value.replace(reInvalidKeys, "");
  }
  value = value.replace(/\./g, (text, i) => {
    if (i === 2 || i === 5) {
      return text;
    } else {
      return "";
    }
  }).replace(/д/g, (text, i) => {
    if (typeof i === "number" && i <= 1) {
      return text;
    } else {
      return "";
    }
  }).replace(/м/g, (text, i) => {
    if (typeof i === "number" && (i === 3 || i === 4)) {
      return text;
    } else {
      return "";
    }
  }).replace(/г/g, (text, i) => {
    if (typeof i === "number" && i > 5) {
      return text;
    } else {
      return "";
    }
  });
  if (value.length >= 2 && value[2] !== ".") {
    value = `${value.slice(0, 2)}.${value.slice(2)}`;
  }
  if (value.length >= 5 && value[5] !== ".") {
    value = `${value.slice(0, 5)}.${value.slice(5)}`;
  }
  resultNumberParts = value.slice(0, 10).split(".");
  let [day, month, year] = resultNumberParts;
  if (day && !isNaN(Number(day[0])) && Number(day[0]) > 3) {
    day = `0${day[0]}`;
  }
  if (day && day.length === 2 && !isNaN(Number(day))) {
    if (Number(day) > 31) {
      day = `31`;
    }
    if (Number(day) === 0) {
      day = `01`;
    }
  }
  if (month && !isNaN(Number(month[0])) && Number(month[0]) > 1) {
    month = `0${month[0]}`;
  }
  if (month && month.length === 2 && !isNaN(Number(month))) {
    if (Number(month) > 12) {
      month = `12`;
    }
    if (Number(month) === 0) {
      month = `01`;
    }
  }
  return {
    numberParts: [day, month, year].filter(part => part),
    isDecimal: false
  };
}

export { dateValidator };
