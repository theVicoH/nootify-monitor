import * as regexpManager from "../regexp/extractAndConvertPrice.js"
import * as apiRestockManager from "../api-restock/sendToRestockAlertSiteNotSupportedRequest.js"
import * as extractCountryAbvFromUrl from "../regexp/extractCountryAbvFromUrl.js"
import * as extractCountryAbvFromCountryFlag from "../regexp/extractCountryAbvFromCountryFlag.js"
import * as extractPID from "../regexp/extractPID.js"
import * as extractTextBetweenBracketsAndParentheses from "../regexp/extractTextBetweenBrackets.js"
import * as extractSizesFromString from "../regexp/extractSizesFromString.js"
import * as extract2Or3LetterWords from "../regexp/extract2Or3LetterWords.js"
import { extractSizesFromEmbed } from "../regexp/extractSizesFromEmbed.js"
import { sendToTrinity } from "../trinity/sendToTrinity.js"

export const COUNTRIES_WITH_FLAGS_AND_ABBREVIATIONS  = [
    {
      flag: "🇫🇷",
      name: "FRANCE",
      abreviation: "fr",
    },
    {
      flag: "🇬🇧",
      name: "UNITED KINGDOM",
      abreviation: "uk",
    },
    {
      flag: "🇬🇧",
      name: "UNITED KINGDOM",
      abreviation: "om",
    },
    {
      flag: "🇦🇺",
      name: "AUSTRALIA",
      abreviation: "au",
    },
    {
      flag: "🇸🇬",
      name: "SINGAPORE",
      abreviation: "sg",
    },
    {
      flag: "🇸🇪",
      name: "SVERIGE",
      abreviation: "se",
    },
    {
      flag: "🇫🇮",
      name: "SUOMI",
      abreviation: "fi",
    },
    {
      flag: "🇮🇪",
      name: "IRELAND",
      abreviation: "ie",
    },
    {
      flag: "🇩🇪",
      name: "DEUTSCHLAND",
      abreviation: "de",
    },
    {
      flag: "🇩🇰",
      name: "DANMARK",
      abreviation: "dk",
    },
    {
      flag: "🇳🇱",
      name: "NEDERLAND",
      abreviation: "nl",
    },
    {
      flag: "🇮🇹",
      name: "ITALIA",
      abreviation: "it",
    },
    {
      flag: "🇲🇾",
      name: "MALAYSIA",
      abreviation: "my",
    },
    {
      flag: "🇪🇸",
      name: "ESPAÑA",
      abreviation: "es",
    },
    {
      flag: "🇹🇭",
      name: "THAILAND",
      abreviation: "th",
    },
    {
      flag: "🇺🇸",
      name: "USA",
      abreviation: "us",
    },
    {
      flag: "🇧🇪",
      name: "BELGIË",
      abreviation: "be",
    },
    {
      flag: "🇦🇹",
      name: "ÖSTERREICH",
      abreviation: "at",
    },
    {
      flag: "🇵🇹",
      name: "PORTUGAL",
      abreviation: "pt",
    },
    {
      flag: "🇳🇿",
      name: "NEW ZEALAND",
      abreviation: "nz",
    },
    {
      flag: "🇬🇷",
      name: "GREECE",
      abreviation: "gr",
    },
    {
      flag: "🇷🇴",
      name: "ROMANIA",
      abreviation: "ro",
    },
    {
      flag: "🇮🇱",
      name: "ISRAEL",
      abreviation: "il",
    },
];
function isSiteAuthorized(siteName, authorized_sites) {
  return authorized_sites.includes(siteName);
}
function findMatchInSites(inputString, sites) {
  if ( inputString ){
    for (const site of sites) {
      if ((inputString.toLowerCase()).includes(site)) {
        return site; // Return the first matching element
      }
    }
  }
  return null; // Return null if no match is found
}

function findSku(inputString) {
  // Créez une expression régulière pour correspondre au format du SKU
  const skuPattern = /[A-Z0-9-]+/;

  // Utilisez la méthode match() de la chaîne pour trouver tous les correspondances SKU
  const results = inputString.match(skuPattern);

  // Parcourez les correspondances et retournez celle qui contient un trait d'union "-"
  if (results) {
    for (const result of results) {
      if (result.includes('-')) {
        return result;
      }
    }
  }

  // Si aucun SKU n'est trouvé, renvoyez null
  return null;
}


// function extractPriceFromFields(embed) {
//   var price = 0;
//   var currency = "EUR";

//   if (embed.fields) {
//     const priceFieldIndex = embed.fields.findIndex(field => field.name.toLowerCase().includes("price"));

//     if (priceFieldIndex !== -1) {
//       const priceField = embed.fields[priceFieldIndex];
//       const result = regexpManager.extractAndConvertPrice(priceField.value);
//       console.log("🚀 ~ file: webhooks.js:191 ~ extractPriceFromFields ~ result:", result)
//       if (result.amount !== 0) {
//           price = result.amount;
//       }
//       if (result.currency) {
//           currency = result.currency;
//       }
//     }
//   }

//   return { price, currency };
// }

function extractCountryAbbreviationFromURL(url) {
  try {
    const result = extractCountryAbvFromUrl.extractTLDFromURL(url);

    if (result.publicSuffix) {
      let country = result.publicSuffix.toUpperCase();

      // If COUNTRY is "COM.SG" / "COM.UK" we take the last index
      const countryArray = country.split('.');
      if (countryArray.length === 2) {
        country = countryArray[1].toUpperCase();
      }

      return { country, storewithtld: result.domain.replaceAll('.', '') };
    }
  } catch (error) {
    //empty
  }

  return { country: null, storewithtld: null };
}


/* 
usernameParameters {
  store: 'sizefr',
  key: '2a54a4bd66',
  country: '',
  secret: 'b64d50a93b0c907c109b29fa9b3ca5a2',
  api_key: '4EE1BC68D4E342D49D39C00ABF5942D2',
  cequence_key: '4EE1BC68D4E342D49D39C00ABF5942D2'
}
*/
export async function sendToRestockAlertSiteNotSupportedMeshBackupChannel(m, PIDValue, authorName, usernameParameters) {
  const embed = m.embeds[0];
  
  var sites = ["size", "jdsports", "footpatrol", "sizeofficial"];
  var authorized_sites = ["sizefr", "sizebe","sizeofficialfr", "jdsportsfr", "jdsportsbe", "footpatrol"];
  var thumbnail = embed.thumbnail ? embed.thumbnail.url : "none";
  var price = 0;
  // var product_name = embed.title;
  var product_name = null;
  var product_page = embed.url;
  let site = embed.title;
  var currency = "EUR";
  // var site = null;
  var siteFinalWithTLD = null;
  var country = null;
  var sku = null;
  var domain = null;
  var result = null;
  var storewithtld = null;
  var keyAuthorName = embed.author ? embed.author.name : null;
  var keyMessageAuthorName = m.author ? m.author.username : null;
  var sizes = null;
  var pidfinal = "null";
  
  // const matchingSite2 = findMatchInSites(m.embeds[0].title, sites);
  // if (matchingSite2 !== null) {
  //   console.log(`Found match: ${matchingSite2}`);
  //   site = matchingSite2;
  // } else {
  //   console.log("No match found in the string.");
  // }

  if ( usernameParameters && usernameParameters.store && usernameParameters.country){
    storewithtld = usernameParameters.store;
    country = usernameParameters.country.toUpperCase();
  }else{
    console.log("🚀 ~ file: webhooks.js:301 ~ sendToRestockAlertSiteNotSupportedMeshBackupChannel ~ else:")
    if ( keyMessageAuthorName ){
      console.log("🚀 ~ file: webhooks.js:302 ~ sendToRestockAlertSiteNotSupportedMeshBackupChannel ~ keyMessageAuthorName:", keyMessageAuthorName)
      // Detect the country code IN THE USERNAME
      const countryCode = extract2Or3LetterWords.extract2Or3LetterWords(keyMessageAuthorName);
    
      // More than 3 letters can be a country abbreviation
      if (countryCode.length > 0) {
        console.log("2 or 3 letter words found:", countryCode);
        //GET THE LAST ELEMENT EG: ["co", "uk"] = UK
        country = countryCode[countryCode.length - 1].toUpperCase();
      } else {
        console.log("No 2 or 3 letter words found.");
      }

      // Get the website name
      const matchingSite = findMatchInSites(keyMessageAuthorName, sites);
      if (matchingSite !== null) {
        console.log("🚀 ~ file: webhooks.js:368 ~ sendToRestockAlertSiteNotSupportedMeshBackupChannel ~ matchingSite: Found match: ${matchingSite}")
        site = matchingSite;
      } else {
        console.log("🚀 ~ file: webhooks.js:372 ~ sendToRestockAlertSiteNotSupportedMeshBackupChannel ~ No match found in the string:")
      }

      if (country && site) {
        storewithtld = site+country;
      }
    }

    ///Get first site and country from author.name
    // try {
    //   result = extractCountryAbvFromUrl.extractTLDFromURL(keyAuthorName);
    //   //console.log("🚀 ~ file: webhooks.js:265 ~ sendToRestockAlertSiteNotSupportedMeshBackupChannel ~ result:", result)
    //   if  ( result.publicSuffix ){
    //     country = result.publicSuffix.toUpperCase();
    //     //IF COUNTRY IS "COM.SG" / "COM.UK" WE TAKE THE LAST INDEX
    //     var countryArray = country.split('.');
    //     if ( countryArray.length == 2 ){
    //       country = countryArray[1].toUpperCase();
    //     }
    //   }
    //   storewithtld = result.domain.replaceAll('.', '');
    // } catch (error) {
    //   // if (error.message === "Invalid domain format") {
    //     //console.log("🚀 ~ file: webhooks.js:411 ~ sendToRestockAlertSiteNotSupportedMeshBackupChannel ~ Invalid domain format", "Invalid domain format")
    //       //site = (authorName.replace('.', '').toLowerCase()).replaceAll(' ', '');
    //       //console.log("🚀 ~ file: webhooks.js:280 ~ sendToRestockAlertSiteNotSupportedMeshBackupChannel ~ site:", site)
    //     // console.log("🚀 ~ file: webhooks.js:413 ~ sendToRestockAlertSiteNotSupportedMeshBackupChannel ~ site:", site)
    //     // console.log("🚀 ~ file: webhooks.js:415 ~ sendToRestockAlertSiteNotSupportedMeshBackupChannel ~ authorName:", site)
    //   // } else {
    //   //   console.error("An error occurred:", error.message);
    //   // }
    // }
    if ( !keyAuthorName ) {
      const { countryGotFromExtraction, storewithtldGotFromExtraction } = extractCountryAbbreviationFromURL(keyAuthorName);
      if (countryGotFromExtraction !== null) {
        country = countryGotFromExtraction;
      }
      if (storewithtldGotFromExtraction !== null) {
        storewithtld = countryGotFromExtraction;
      }
    }

  }

  if (embed.fields) {

    // GET PRICE AND CURRENCY abbreviation EG: EUR / USD ....
    const priceFieldIndex = embed.fields.findIndex(field => field.name.toLowerCase().includes("price"));
    console.log("🚀 ~ file: webhooks.js:259 ~ sendToRestockAlertSiteNotSupportedMeshBackupChannel ~ priceFieldIndex:", priceFieldIndex)

    if (priceFieldIndex !== -1) {
        const priceField = embed.fields[priceFieldIndex];
        const result = regexpManager.extractAndConvertPrice(priceField.value);
        console.log("🚀 ~ file: webhooks.js:264 ~ sendToRestockAlertSiteNotSupportedMeshBackupChannel ~ result:", result)
        
        if (result.amount !== 0) {
            price = result.amount;
        }

        if (result.currency) {
            currency = result.currency;
        }
    }

    // GET PRODUCT SIZE IF EXIST IN FIELDS
    const sizesFieldIndex = embed.fields.findIndex(field =>
      field.name.toLowerCase().includes("qt") &&
      field.name.toLowerCase().includes("size") &&
      field.name.toLowerCase().includes("[stock]")
    );
    if (sizesFieldIndex !== -1) {
        const priceField = embed.fields[sizesFieldIndex];
        sizes = extractSizesFromString.extractSizesFromString(priceField.value);     
    }
    else{
      const sizesTemporary = extractSizesFromEmbed(embed);
      if (sizesTemporary !== null) {
        console.log("sizes found", sizesTemporary);
        sizes = sizesTemporary;
      } else {
        console.log("🚀 ~ file: sendToRestockAlertSiteNotSupportedMeshBackupChannel.js:338 ~ sendToRestockAlertSiteNotSupportedMeshBackupChannel ~ No sizes found.:")
      }
    }
  }


  /* IF country if not defined we get it by an other way
    flag can be found on PID 
  */

  if ( !country ){
    const regionFieldIndex = embed.fields.findIndex(field => field.name.toLowerCase().includes("region"));
    
    // If region field found
    if (regionFieldIndex !== -1) {
        const regionField = embed.fields[regionFieldIndex];
        console.log("🚀 ~ file: sendToRestockAlertSiteNotSupportedMeshBackupChannel.js:374 ~ sendToRestockAlertSiteNotSupportedMeshBackupChannel ~ regionField:", regionField)

        // var countryTemp = COUNTRIES_WITH_FLAGS_AND_ABBREVIATIONS .find((c) => c.flag === regionField.value);
        var countryTemp = COUNTRIES_WITH_FLAGS_AND_ABBREVIATIONS .find((c) => c.flag.includes(regionField.value));
        if ( countryTemp && countryTemp.abreviation){
          country = countryTemp.abreviation.toUpperCase();
        }

        // If country is not present in PID Field
        if (country == null) {
            country = extractCountryAbvFromCountryFlag.extractCountryAbvFromCountryFlag(regionField.value);
            console.log("🚀 ~ file: webhooks.js:385 ~ sendToRestockAlertSiteNotSupportedMeshBackupChannel ~ country:", country)
        } 
    }else if (authorName){
        //we fetch in the url / in the author name of the webhook
        country = extractCountryAbvFromUrl.extractCountryAbvFromUrl(authorName);
    }
  }

  
    const skuFieldIndex = embed.fields.findIndex(field => field.name.toLowerCase().includes("sku"));
    console.log("🚀 ~ file: sendToRestockAlertSiteNotSupportedMeshBackupChannel.js:377 ~ sendToRestockAlertSiteNotSupportedMeshBackupChannel ~ skuFieldIndex:", skuFieldIndex)
    // If region field found
    if (skuFieldIndex !== -1) {
        const skuField = embed.fields[skuFieldIndex];

        var skuFoundOrNot = findSku(skuField.value)
        console.log("🚀 ~ file: sendToRestockAlertSiteNotSupportedMeshBackupChannel.js:383 ~ sendToRestockAlertSiteNotSupportedMeshBackupChannel ~ skuField.value:", skuFoundOrNot)
        if ( skuFoundOrNot != null ){
          sku = skuFoundOrNot
        }
    }
  
  /* 
    We get the product name if a description in the embed exist
  */

  if (!product_name && embed.description) {
    //const inputString = '[Jordan Air 1 Mid](https://jdsports.fr)';
    /*
      Results: 
      0:"Jordan 4 Midnight Navy"
      1:"https://jdsports.fr"
    */
    const textBetweenBrackets = extractTextBetweenBracketsAndParentheses.extractTextBetweenBracketsAndParentheses(embed.description);
    console.log("🚀 ~ file: sendToRestockAlertSiteNotSupportedMeshBackupChannel.js:416 ~ sendToRestockAlertSiteNotSupportedMeshBackupChannel ~ textBetweenBrackets:", textBetweenBrackets)
    if ( textBetweenBrackets && textBetweenBrackets.length === 2 ){
      product_name = textBetweenBrackets[0];
      product_page = textBetweenBrackets[1];
      console.log("🚀 ~ file: sendToRestockAlertSiteNotSupportedMeshBackupChannel.js:422 ~ sendToRestockAlertSiteNotSupportedMeshBackupChannel ~ product_page:", product_page)
    }
  } else {
    // The embed.description is null.
    console.log("embed.description is null.");
  }


  //if site is null, we get via the authorname
  if ( !site && authorName){
    site = authorName;
  }
  console.log("🚀 ~ file: sendToRestockAlertSiteNotSupportedMeshBackupChannel.js:424 ~ sendToRestockAlertSiteNotSupportedMeshBackupChannel ~ site::", storewithtld)



  /* 
    If storeWithTLD not exist but site and country abbreviation exist we can create it
  */

  if ( !storewithtld && site && country ){
    siteFinalWithTLD = (site+country.toLowerCase()).replaceAll(" ", "");
    console.log("🚀 ~ file: webhooks.js:351 ~ sendToRestockAlertSiteNotSupportedMeshBackupChannel ~ site:", site)
  } 
  else if ( storewithtld ){
    siteFinalWithTLD = storewithtld.replaceAll(" ", "");
    console.log("🚀 ~ file: webhooks.js:354 ~ sendToRestockAlertSiteNotSupportedMeshBackupChannel ~ site:", site)
  }

  siteFinalWithTLD = siteFinalWithTLD != null ? siteFinalWithTLD.toLowerCase() : "null";


  /* 
    We create now the pidFinal
  */

  const pidOrSkuFieldIndex = embed.fields.findIndex(field => {
    const fieldName = field.name.toLowerCase();
    return fieldName.includes("pid") || fieldName.includes("sku");
  });
  
  // If pid field name or sku field name found
  if (pidOrSkuFieldIndex !== -1) {
      const pidField = embed.fields[pidOrSkuFieldIndex];
      var extractedPid = extractPID.extractPID(pidField.value);
      
      //Verify if its a number inside the string
      if (!isNaN(extractedPid)) {
          // If it's a number, add a the pid extension to it
          if ( site != null ){
            pidfinal = `${extractedPid}_${site}${country}`.toLocaleLowerCase();

          }else{
            pidfinal = `${extractedPid}_${siteFinalWithTLD}`;
          }
          console.log("🚀 ~ file: sendToRestockAlertSiteNotSupportedMeshBackupChannel.js:384 ~ sendToRestockAlertSiteNotSupportedMeshBackupChannel ~ pidfinal:", pidfinal)
      } else{
          pidfinal = extractedPid;
          console.log("🚀 ~ file: sendToRestockAlertSiteNotSupportedMeshBackupChannel.js:386 ~ sendToRestockAlertSiteNotSupportedMeshBackupChannel ~ pidfinal:", pidfinal)
      }
  }

  if ( !product_page ){
    if ( embed.url ){
      product_page = embed.url;
    }else if ( pidfinal ){
      product_page = pidfinal
    }
  }

  //product_page = embed.url != null ? embed.url : pidfinal != null ? pidfinal : "null";


  /* 
    DEBUGGING
  */

  console.log("🚀 ~ file: webhooks.js:466 ~ sendToRestockAlertSiteNotSupportedMeshBackupChannel ~ product_page:", (embed.url != null ? embed.url : pidfinal != null ? pidfinal : "null"))
  console.log("🚀 ~ file: webhooks.js:461 ~ sendToRestockAlertSiteNotSupportedMeshBackupChannel ~ authorName:", authorName)
  console.log("🚀 ~ file: webhooks.js:466 ~ sendToRestockAlertSiteNotSupportedMeshBackupChannel ~ product_name:", product_name)
  console.log("🚀 ~ file: webhooks.js:466 ~ sendToRestockAlertSiteNotSupportedMeshBackupChannel ~ product_page:", product_page)
  console.log("🚀 ~ file: webhooks.js:463 ~ sendToRestockAlertSiteNotSupportedMeshBackupChannel ~ pidfinal:", pidfinal)
  console.log("🚀 ~ file: webhooks.js:469 ~ sendToRestockAlertSiteNotSupportedMeshBackupChannel ~ price:", price)
  console.log("🚀 ~ file: webhooks.js:356 ~ sendToRestockAlertSiteNotSupportedMeshBackupChannel ~ country:", country)
  console.log("🚀 ~ file: webhooks.js:358 ~ sendToRestockAlertSiteNotSupportedMeshBackupChannel ~ site:", site)
  console.log("🚀 ~ file: webhooks.js:358 ~ sendToRestockAlertSiteNotSupportedMeshBackupChannel ~ siteFinalWithTLD:", siteFinalWithTLD)
  console.log("🚀 ~ file: webhooks.js:499 ~ sendToRestockAlertSiteNotSupportedMeshBackupChannel ~ sizes:", sizes)
  console.log("🚀 ~ file: sendToRestockAlertSiteNotSupportedMeshBackupChannel.js:478 ~ sendToRestockAlertSiteNotSupportedMeshBackupChannel ~ sku:", sku)
  

  /* 
    FINAL
  */

  // WE VERIFY IF WE CAN SEND TO TRINITY OR NOT
  if (isSiteAuthorized(siteFinalWithTLD, authorized_sites)) {
    console.log(`"${siteFinalWithTLD}" is an authorized site.`);
    sendToTrinity(pidfinal, siteFinalWithTLD, m, currency, country, product_page, sku);
  }

  else{
    apiRestockManager.sendToRestockAlertSiteNotSupportedRequest(pidfinal, sku, thumbnail, price, product_name, product_page, currency, siteFinalWithTLD, country, sizes)
    .then(result => {
        if (result) {
            //console.error('Error:', error);
        } else {
            console.log('Success');
        }
    })
    .catch(error => {
      //empty
    });
  }
}