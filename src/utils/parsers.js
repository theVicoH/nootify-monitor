import { parse } from "tldts";
import { PROFIT_CHECKER_HANDLED_BRANDS } from "../globals/constants.js";

export function isMessageEmbeded(m) {
  return m.embeds && m.embeds.length > 0;
}

export function parsePID(embed) {
  const pidFieldIndex = embed.fields.findIndex((field) => {
    return field.name.toLowerCase().includes("pid");
  });

  if (pidFieldIndex !== -1) {
    const priceField = embed.fields[pidFieldIndex];
    const result = extractPID(priceField.value);
    if (result != null) {
      return result;
    }
    return null;
  }
}

export function isMissingField(PIDValue, authorName, username, title) {
  return !PIDValue || !authorName || !username || !title;
}

/**
 * Extracts the country from an URL given.
 * @param {string} url
 * @returns {string|null} country
 */
export function extractCountryFromURL(url) {
  const result = extractTLDFromURL(url);

  if (result.publicSuffix) {
    let country = result.publicSuffix.toUpperCase();

    // If COUNTRY is "COM.SG" / "COM.UK" we take the last index
    const countryArray = country.split(".");
    if (countryArray.length === 2) {
      country = countryArray[1].toUpperCase();
    }

    return country;
  }

  return null;
}

export function extractStoreTLDFromURL(url) {
  const result = extractTLDFromURL(url);

  if (result.publicSuffix) {
    return result.domain.replaceAll(".", "");
  }

  return null;
}

export function extractStoreFromURL(url) {
  const regex =
    /^https:\/\/www\.([a-zA-Z0-9-]+)\.[a-zA-Z0-9-.]+\/product\/[a-zA-Z0-9-]+\/[0-9a-zA-Z_]+\/?/gi;

  const urlWOParams = url.split("?")[0];

  const result = regex.exec(urlWOParams);

  if (result && result[1]) {
    console.log(`Store found: ${result[1]}`);
    return result[1];
  }

  return null;
}

/**
 * Extracts the top level domain from a given URL using the tldts library.
 * @param {string} domain
 * @returns
 */
export function extractTLDFromURL(domain) {
  const analyzedUrl = parse(domain);
  if (analyzedUrl && analyzedUrl.domain && analyzedUrl.publicSuffix) {
    return analyzedUrl;
  }

  if (!analyzedUrl.isIp) {
    console.log(`${domain} is not an URL`);
    return null;
  }
}

/**
 * Tries to extract the country from the given country flag emote on discord.
 * @param {string} fieldValue
 * @returns {string} country
 */
export function extractCountryFromCountryFlag(fieldValue) {
  const countryCodeMatch = fieldValue.match(/:flag_(\w+):/);
  if (countryCodeMatch && countryCodeMatch[1]) {
    const country = countryCodeMatch[1];
    console.log(country);
    return country.toUpperCase();
  } else {
    console.log("Country code not found.");
  }
}

export function findMatch(str, strArray) {
  for (const s of strArray) {
    if (str.includes(s)) {
      return s;
    }
  }
  return null;
}

export function extractSizes(str) {
  const regex = /\|(\s*(\d+(\.\d+)?|\d+\s*\/\s*\d+))\s*\[/g;
  const matches = [];

  let match;
  while ((match = regex.exec(str)) !== null) {
    const extractedValue = match[1].trim();
    matches.push(extractedValue);
  }

  return matches;
}
export function extractSizesFromEmbed(embed) {
  const allSizes = [];
  const sizeRegex = /(\b\d{1,5}(?:\.\d{1,5})?(?:\s+\d{1,5}\/\d{1,5})?\b)/g; // Regular expression to match numeric sizes with optional slash

  // Obtenez la liste des champs de l'objet "embed"
  const fields = embed.fields;
  // Parcourez tous les champs pour trouver ceux avec le nom "Sizes"
  for (const field of fields) {
    if (
      field.name.toLowerCase().includes("sizes") &&
      !field.name.toLowerCase().includes("sold out")
    ) {
      const fieldValue = field.value;

      // Recherchez les correspondances de tailles numériques dans le champ "value" en utilisant la regex
      const sizeMatches = fieldValue.match(sizeRegex);

      if (sizeMatches) {
        // Ajoutez les tailles trouvées au tableau final
        for (const size of sizeMatches) {
          allSizes.push(size);
        }
      }
    }
  }

  // Vérifiez si des tailles ont été trouvées
  if (allSizes.length > 0) {
    return allSizes;
  } else {
    return null; // Aucune taille trouvée, retournez null
  }
}

export function extractPID(value) {
  const PIDRegex = /`?(\w+)`?/;
  const PIDMatch = value.match(PIDRegex);

  if (PIDMatch) {
    return PIDMatch[1];
  }

  return null;
}

export function extractPIDFromProductPage(url) {
  const regex =
    /^https:\/\/www\.[a-zA-Z0-9.-]+\/product\/[a-zA-Z0-9-]+\/([0-9]+_[a-zA-Z]+)\/$/gi;

  const match = regex.exec(url);

  if (match) {
    return match[1];
  }

  return null;
}

export function extractPIDWebsiteFromProductPage(url) {
  const regex =
    /^https:\/\/www\.[a-zA-Z0-9.-]+\/product\/[a-zA-Z0-9-]+\/[0-9]+_([a-zA-Z]+)\/$/gi;

  const match = regex.exec(url);

  if (match) {
    return match[1];
  }

  return null;
}

export function extractAndConvertPrice(value) {
  const amountRegex = /(\d+(?:\.\d{1,2})?)/;
  const currencySymbolRegex =
    /(€|EUR|\$|USD|£|GBP|¥|JPY|₹|INR|₽|RUB|₩|KRW|฿|THB|₺|TRY|R\$|BRL|CHF|SEK|AUD|CAD|NZD|DKK|NOK|SGD|HKD|MXN|PLN|ZAR|AED|CNY)/i;
  const currencyMap = {
    "€": "EUR", // Euro
    $: "USD", // US Dollar
    "£": "GBP", // British Pound Sterling
    "¥": "JPY", // Japanese Yen
    "₹": "INR", // Indian Rupee
    "₽": "RUB", // Russian Ruble
    "₩": "KRW", // South Korean Won
    "฿": "THB", // Thai Baht
    "₺": "TRY", // Turkish Lira
    R$: "BRL", // Brazilian Real
    CHF: "CHF", // Swiss Franc
    SEK: "SEK", // Swedish Krona
    AUD: "AUD", // Australian Dollar
    CAD: "CAD", // Canadian Dollar
    NZD: "NZD", // New Zealand Dollar
    DKK: "DKK", // Danish Krone
    NOK: "NOK", // Norwegian Krone
    SGD: "SGD", // Singapore Dollar
    HKD: "HKD", // Hong Kong Dollar
    MXN: "MXN", // Mexican Peso
    PLN: "PLN", // Polish Złoty
    ZAR: "ZAR", // South African Rand
    AED: "AED", // United Arab Emirates Dirham
    CNY: "CNY", // Chinese Yuan
    INR: "INR", // Indian Rupee
    JPY: "JPY", // Japanese Yen
    RUB: "RUB", // Russian Ruble
    TRY: "TRY", // Turkish Lira
    BRL: "BRL", // Brazilian Real
  };

  // Create the regex using the pattern and the 'i' flag for case-insensitive matching

  const amountMatch = value.match(amountRegex);
  const currencySymbolMatch = value.match(currencySymbolRegex);

  let amount = 0;
  let currency = "EUR";

  if (amountMatch) {
    // Replace "_ _ " by spaces for parseFloat works
    const amountString = amountMatch[0].replace(/_ /g, "");
    amount = parseFloat(amountString);
  }

  if (currencySymbolMatch) {
    const currencySymbol = currencySymbolMatch[0];
    currency = currencyMap[currencySymbol] || currencySymbol;
  }

  return { amount, currency };
}

/**
 * Parses brand from a given website URL
 * @param {string} product_page - URL of the product page Ex: https://www.footpatrol.com/product/grey-adidas-originals-campus-00s-womens/619049_footpatrolcom/
 * @returns {string} - Brand name Ex: adidas
 */
export function getBrandFromProductPage(product_page) {
  for (const brand of PROFIT_CHECKER_HANDLED_BRANDS) {
    if (product_page.includes(brand.toLowerCase())) {
      return brand;
    }
  }

  return null;
}

/**
 * Parses gender from a given website URL
 * @param {string} product_page - URL of the product page Ex: https://www.footpatrol.com/product/grey-adidas-originals-campus-00s-womens/619049_footpatrolcom/
 * @returns {string} - Gender Ex: W
 */
export function getGenderFromProductPage(product_page) {
  const womanCheck = ["femme", "women's", "womens"];

  for (const check of womanCheck) {
    if (product_page.includes(check)) {
      return "W";
    }
  }

  return "M";
}

/**
 * Parses size metric from a given size, returns "US" if size is less than 16, "EU" otherwise
 * @param {string} size
 * @returns {string}
 */
export function getSizeMetricOriginFromSize(size) {
  if (+size > 16) {
    return "EU";
  }

  return "US";
}
