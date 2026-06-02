const compose = (...functions) => arg => {
  let result = arg;
  functions.forEach(func => {
    result = func(result);
  });
  return result;
};

export { compose };
