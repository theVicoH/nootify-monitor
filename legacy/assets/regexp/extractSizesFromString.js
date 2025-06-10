export function extractSizesFromString(inputString) {
    /*
    const inputString = `[QT](https://go.alphamonitors.com/aHR0cHM6Ly93d3cuamRzcG9ydHMuaXQvcHJvZHVjdC92ZXJkZS1uaWtlLWR1bmstbG93LWRvbm5hLzE5NDQ0MTA4X2pkc3BvcnRzaXQv) | 4.5 [1] 
    \n
    [QT](https://go.alphamonitors.com/aHR0cHM6Ly93d3cuamRzcG9ydHMuaXQvcHJvZHVjdC92ZXJkZS1uaWtlLWR1bmstbG93LWRvbm5hLzE5NDQ0MTA4X2pkc3BvcnRzaXQv) | 4.5 [1] 
    \n
    [QT](https://go.alphamonitors.com/aHR0cHM6Ly93d3cuamRzcG9ydHMuaXQvcHJvZHVjdC92ZXJkZS1uaWtlLWR1bmstbG93LWRvbm5hLzE5NDQ0MTA4X2pkc3BvcnRzaXQv) | 43 / 2 [2] `;
 */
    //["4.5", "4.5", "43 / 2"]
    const regex = /\|(\s*(\d+(\.\d+)?|\d+\s*\/\s*\d+))\s*\[/g;
    const matches = [];
    
    let match;
    while ((match = regex.exec(inputString)) !== null) {
      const extractedValue = match[1].trim();
      matches.push(extractedValue);
    }
    
    return matches;
  }