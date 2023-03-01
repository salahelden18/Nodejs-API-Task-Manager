exports.requireness = (fieldName) => {
  return `The ${fieldName} field is required. Please make sure that you added it`;
};

exports.uniqueness = (fieldName) => {
  return `The ${fieldName} is already in use`;
};

exports.numOfCharacters = (fieldName, num) => {
  return `The ${fieldName} should be ${num} characters long`;
};

exports.succOrFail = (num) => {
  return num == 1 ? "success" : "fail";
};
