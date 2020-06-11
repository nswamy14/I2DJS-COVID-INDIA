export function convertToIndianFormat(number) {
  if (!number) {
    return number;
  }
  let numString = String(number);
  let convertedNum = "";
  if (numString.length > 3) {
    convertedNum = "," + numString.slice(-3);
    numString = numString.slice(0, -3);
    while (numString.length > 2) {
      convertedNum = "," + numString.slice(-2) + convertedNum;
      numString = numString.slice(0, -2);
    }
    convertedNum = numString + convertedNum;
    return convertedNum;
  } else {
    return numString;
  }
}
