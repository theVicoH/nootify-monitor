import { parse } from 'tldts';

export function extractCountryAbvFromUrl(url) {
    const urlMatch = url.match(/https:\/\/(?:www\.)?([\w.]+)\//);
    let countryABV = '';
    
    if (urlMatch) {
      const domainParts = urlMatch[1].split('.');
        if (domainParts.length > 1) {
            countryABV = domainParts[domainParts.length - 1].toUpperCase();
            console.log("countryABV", countryABV)
            return countryABV;
        }
    }
    
    return null;
    //return the country / the storename
 }

 //Return publicSuffix, domain
 export function extractTLDFromURL(domain) {
  // Use a try-catch block to handle potential errors
  try {
    // Work with "size.co.uk" -> return "co.uk"
    // If valid url we return the TLD
    const analyzedUrl = parse(domain);
    if (analyzedUrl && analyzedUrl.domain && analyzedUrl.publicSuffix) {
      //return { publicSuffix: analyzedUrl.publicSuffix, domain: analyzedUrl.domain };
      return analyzedUrl;
    }
    
    if (!analyzedUrl.isIp){
      throw new Error("not an url"); // Throw a custom error
    }
    // } else {
    //   return null;
    // }
    
  } catch (error) {
    // Handle any errors that may occur during parsing
    //console.error("Error parsing domain:", error);
    return error;
  }
}

 export function extractDomainAndTLDFromTitleORUrl(input) {
  const urlMatch = input.match(`^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)`);
  var result = null
  if (urlMatch) {
      const mainDomain = urlMatch[1].toLowerCase();
      result = mainDomain;
  } else {
      const domainParts = input.split(' ');
       if (domainParts.length > 1) {
          //Index 1 = Pays
          if ( containsMax3Letters(domainParts[1]) ){
            result = domainParts[1]
          }else{
            const lastPart = domainParts[domainParts.length - 1].toLowerCase();
            if (!lastPart.includes("[BACKEND]")) {
                result = lastPart;
            }
          }
      }
  }
  if (result.toLowerCase().includes("[backend]")) {
      result = result.replaceAll("[backend]", "");
  }
  return result?.replaceAll('.', '').replaceAll(' ', '');
}

// console.log("jdsports FR", extractDomainAndTLDFromTitleORUrl("jdsports FR")); // Sortie: "jdsportsfr"
// console.log("jdsports.fr", extractDomainAndTLDFromTitleORUrl("jdsports.fr")); // Sortie: "jdsportsfr"
// console.log("size AU [BACKEND]", extractDomainAndTLDFromTitleORUrl("size AU [BACKEND]")); // Sortie: "sizeau"
// console.log("size AU", extractDomainAndTLDFromTitleORUrl("size AU")); // Sortie: "sizeau"
// console.log("https://www.size.au/", extractDomainAndTLDFromTitleORUrl("https://www.size.au/")); // Sortie: "sizeau"
// console.log("https://www.size.co.uk", extractDomainAndTLDFromTitleORUrl("https://www.size.co.uk")); // Sortie: "sizecouk"


