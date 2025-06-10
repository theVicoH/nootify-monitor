export function extractPID(value) {
    // Use a regular expression to extract the PID (inside backticks or any word character)
    const PIDRegex = /`?(\w+)`?/;
    const PIDMatch = value.match(PIDRegex);

    if (PIDMatch) {
        const PID = PIDMatch[1];
        return PID;
    }
 
    //console.log(extractPIDifExist(" 677767_dzqdqzdzq _ _")); // Output: 677767_dzqdqzdzq
    //console.log(extractPIDifExist("`677767` _ _")); // Output: 677767
    // Return null if no PID was found
    return null;
}