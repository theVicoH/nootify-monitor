export const extractTimestamp = (str) => {
    const regex = /(?<=<t:)[A-Za-z0-9]+(?=>)/;
    const matches = str.match(regex);
    if (matches && matches.length > 0) {
        const timestamp = parseInt(matches[0], 10);
        console.log(timestamp); // Affiche : 1625834500
        return timestamp;
    } else {
        console.log("No timestamp found.");
    }
}
