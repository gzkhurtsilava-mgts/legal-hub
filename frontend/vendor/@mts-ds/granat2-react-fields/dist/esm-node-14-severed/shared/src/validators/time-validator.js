function timeValidator({
  numberParts
}) {
  let value = numberParts.join("");
  value = value.replace(/\D/g, "");
  value = value.slice(0, 4);
  let hours = value.slice(0, 2);
  let minutes = value.slice(2, 4);
  if (hours.length === 2 && Number(hours) > 23) {
    hours = "23";
  }
  if (minutes.length === 2 && Number(minutes) > 59) {
    minutes = "59";
  }
  return {
    numberParts: [hours, minutes].filter(val => !!val),
    isDecimal: false
  };
}

export { timeValidator };
