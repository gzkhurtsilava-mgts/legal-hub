function currencyMask({
  numberParts
}) {
  const resultNumberParts = [...numberParts];
  const integerPart = numberParts[0];
  const reCurrencyFormat = /\B(?=(\d{3})+(?!\d))/g;
  const resultIntegerPart = integerPart.replace(/\s/g, "").replace(reCurrencyFormat, " ");
  resultNumberParts[0] = resultIntegerPart;
  return {
    numberParts: resultNumberParts
  };
}

export { currencyMask };
