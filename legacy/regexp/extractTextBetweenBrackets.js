export function extractTextBetweenBrackets(inputString) {
  const regex = /\[(.*?)\]/;
  const matches = inputString.match(regex);
  
  if (matches && matches.length >= 2) {
    return matches[1];
  } else {
    return "No text found between brackets.";
  }
}
