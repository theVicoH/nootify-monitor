export function extractTextBetweenBrackets(inputString) {
  const regex = /\[(.*?)\]/;
  const matches = inputString.match(regex);
  
  if (matches && matches.length >= 2) {
    return matches[1];
  } else {
    return null;
  }
}


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
