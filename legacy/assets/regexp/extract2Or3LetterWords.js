export function extract2Or3LetterWords(inputString) {
    // Define a regular expression pattern for 2 or 3 letter words (assuming word boundaries)
    const pattern = /\b[a-zA-Z]{2,3}\b/g;

    // Use the match() method to find all matches in the string
    return inputString.match(pattern) || [];
}