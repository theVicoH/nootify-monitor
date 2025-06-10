export function extractCountryAbvFromCountryFlag(fieldValue) {
  const countryCodeMatch = fieldValue.match(/:flag_(\w+):/);
  if (countryCodeMatch && countryCodeMatch[1]) {
    const countryAbbreviation = countryCodeMatch[1];
    console.log(countryAbbreviation);
    return countryAbbreviation.toUpperCase();
  } else {
    console.log("Country code not found.");
  }
}