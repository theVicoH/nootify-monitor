export function extractTextBetweenBracketsAndParentheses(inputString) {
  const regex = /\[(.*?)\]|\((.*?)\)/g;
  const matches = [];
  let match;

  while ((match = regex.exec(inputString)) !== null) {
    // If there's a match inside square brackets ([])
    if (match[1]) {
      matches.push(match[1]);
    }
    // If there's a match inside parentheses (())
    if (match[2]) {
      matches.push(match[2]);
    }
  }

  if (matches.length > 0) {
    return matches;
  } else {
    return null;
  }
}

export function extract2Or3LetterWords(inputString) {
  // Define a regular expression pattern for 2 or 3 letter words (assuming word boundaries)
  const pattern = /\b[a-zA-Z]{2,3}\b/g;

  // Use the match() method to find all matches in the string
  return inputString.match(pattern) || [];
}


