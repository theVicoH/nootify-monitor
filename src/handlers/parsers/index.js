import {
  extractCountryFromURL,
  extractCountryFromCountryFlag,
  extractStoreFromURL,
  extractStoreTLDFromURL,
  extractSizesFromEmbed,
  extractPID,
  extractSizes,
  extractPIDWebsiteFromProductPage,
  extractPIDFromProductPage,
} from "../../utils/parsers.js";
import {
  extract2Or3LetterWords,
  extractTextBetweenBracketsAndParentheses,
} from "../../utils/regex.js";
import { COUNTRIES_WITH_FLAGS_AND_ABBREVIATIONS } from "../../globals/country_codes.js";
import { WEBSITES } from "../../globals/websites_allowed.js";
import { extractAndConvertPrice } from "../../utils/parsers.js";
import { WEBSITE_KEYS } from "../../globals/keys.js";
import { unfurlProductURL } from "../../utils/index.js";

/**
 * Parses the message and returns the embeds author.
 * @param {Object} embed
 * @returns {string}
 */
export function getEmbedAuthor(embed) {
  console.log("Getting embed author", embed?.author?.name);
  return embed?.author?.name;
}

/**
 * Parses the message and returns the message author.
 * @param {Object} m
 * @returns {string}
 */
export function getMessageAuthor(m) {
  console.log("Getting message author", m?.author?.username);
  return m?.author?.username;
}

/**
 * Tries to extract the price and currency from the embed message given. On failure, returns 0 and EUR.
 * @param {Object} embed
 * @returns {Object}
 */
export function getPrice(embed) {
  console.log("Getting price...");
  let price = 0;
  let currency = "EUR";

  const priceFieldIndex = embed.fields.findIndex((field) =>
    field.name.toLowerCase().includes("price")
  );

  if (priceFieldIndex !== -1) {
    const priceField = embed.fields[priceFieldIndex];
    const result = extractAndConvertPrice(priceField.value);

    if (result.amount !== 0) {
      price = result.amount;
    }

    if (result.currency) {
      currency = result.currency;
    }
  }

  console.log(`Price: ${price} ${currency}`);
  return { price, currency };
}

/**
 * Gets product name from embed message. Returns null on failure.
 * @param {Object} embed
 * @returns {string | null} productName
 */
export function getProductName(embed) {
  console.log(
    `Getting product name from embed definition: "${embed?.description}"`
  );
  if (embed?.description) {
    const textBetweenBrackets = extractTextBetweenBracketsAndParentheses(
      embed.description
    );
    if (textBetweenBrackets && textBetweenBrackets.length === 2) {
      const productName = textBetweenBrackets[0];
      return productName;
    }
  }

  console.log(`Getting product name from embed title: "${embed?.title}"`);
  if (embed?.title) {
    return embed?.title;
  }

  console.log(`Didn't get product name.`);
  return null;
}

/**
 *
 * @param {Object} embed
 * @returns {Promise<string|null>} productName
 */
export async function getProductPage(embed) {
  console.log(`Getting product page from embed ${embed?.description}`);
  let shortenedURL = "";

  if (embed?.description && embed.description.includes("https")) {
    const textBetweenBrackets = extractTextBetweenBracketsAndParentheses(
      embed.description
    );
    if (textBetweenBrackets && textBetweenBrackets.length === 2) {
      const productName = textBetweenBrackets[1];
      shortenedURL = productName;
    }
  }

  console.log(`Getting product page from embed ${embed?.url}`);
  if (embed?.url) {
    shortenedURL = embed?.url;
  }

  const url = await unfurlProductURL(shortenedURL);

  console.log(`Got product page: ${url}`);
  return url;
}

/**
 * Gets website from product page. Returns empty string on failure.
 * @param {Object} embed
 * @param {string} productPage
 * @returns {string}
 */
export function getSite(embed, productPage) {
  console.log(`Getting site from embed ${embed?.url}`);
  if (productPage) {
    let site = extractStoreFromURL(productPage);
    site = site?.replace("sizeofficial", "size");
    console.log(`Got site: ${site}`);
    return site;
  }

  console.log(`Got no site`);
  return "";
}

/**
 * Tries to get the country from the embed message given. On failure, returns null.
 * Firstly will try to get the country from the product page url.
 * @param {Object} embed
 * @param {Object} storeParams
 * @param {string} messageAuthor
 * @param {string} embedAuthor
 * @param {string} productPage
 * @returns {string | null} country
 */
export function getCountry(
  embed,
  storeParams,
  messageAuthor,
  embedAuthor,
  productPage
) {
  console.log(`Getting country...`);
  if (productPage) {
    const country = extractCountryFromURL(productPage);
    if (country !== null) {
      console.log(`Got country from productPage url: ${country}`);
      return country;
    }
  }

  if (embedAuthor) {
    const country = extractCountryFromURL(embedAuthor);
    if (country !== null) {
      console.log(`Got country from embed author url: ${country}`);
      return country;
    }
  }

  const regionFieldIndex = embed.fields.findIndex((field) =>
    field.name.toLowerCase().includes("region")
  );

  if (regionFieldIndex !== -1) {
    const regionField = embed.fields[regionFieldIndex];
    const countryTemp = COUNTRIES_WITH_FLAGS_AND_ABBREVIATIONS.find((c) =>
      c.flag.includes(regionField.value)
    );

    let country = null;

    if (countryTemp && countryTemp.abreviation) {
      country = countryTemp.abreviation.toUpperCase();
    }

    if (!country) {
      country = extractCountryFromCountryFlag(regionField.value);
    }

    console.log(`Got country from region field: ${country}`);
    return country;
  }

  if (storeParams?.country) {
    console.log(`Got country from store params: ${storeParams?.country}`);
    return storeParams?.country.toUpperCase();
  }

  if (messageAuthor) {
    console.log(`Got country from message author: ${messageAuthor}`);
    const countryCode = extract2Or3LetterWords(messageAuthor);
    if (countryCode.length > 0) {
      return countryCode[countryCode.length - 1].toUpperCase();
    }
  }

  console.log(`Got no country`);
  return null;
}

export function getStoreTLD(storeParams, site, country, embedAuthor) {
  if (storeParams?.store) {
    return storeParams.store;
  }

  if (country && site) {
    return `${site}${country.toLowerCase()}`;
  }

  if (embedAuthor) {
    const storeTLD = extractStoreTLDFromURL(embedAuthor);
    console.log(storeTLD);
    if (storeTLD) {
      return storeTLD;
    }
  }

  return null;
}

export function getSiteTLD(storeTLD, site, country, product_page, pid) {
  if (product_page) {
    const storeTLD = extractPIDWebsiteFromProductPage(product_page);
    if (storeTLD) {
      storeTLD.replaceAll("sizeofficial", "size").toLowerCase();
      return storeTLD.replaceAll(" ", "").toLowerCase();
    }
  }

  if (!storeTLD && site && country) {
    return (site + country.toLowerCase()).replaceAll(" ", "").toLowerCase();
  } else if (storeTLD) {
    return storeTLD.replaceAll(" ", "").toLowerCase();
  }

  return "null";
}


/**
 * Tries to get the sizes available for purchase from the embed. Returns null on failure.
 * @param {Object} embed
 * @returns {string | null}
 */
export function getSizes(embed) {
  const sizesFieldIndex = embed.fields.findIndex(
    (field) =>
      field.name.toLowerCase().includes("qt") &&
      field.name.toLowerCase().includes("size") &&
      field.name.toLowerCase().includes("[stock]")
  );

  if (sizesFieldIndex !== -1) {
    const sizesField = embed.fields[sizesFieldIndex];
    const sizes = extractSizes(sizesField.value);
    if (sizes) {
      console.log(`Got sizes from sizes field: ${sizes}`);
      return sizes;
    }
  } else {
    const sizes = extractSizesFromEmbed(embed);
    if (sizes !== null) {
      console.log(`Got sizes from sizes field: ${sizes}`);
      return sizes;
    }
  }

  return null;
}

/**
 * Tries to get the ProductID from the embed. Returns null on failure.
 * @param {Object} embed
 * @param {string} product_page
 * @param {string} site
 * @param {string} country
 * @returns {string | null} pid
 */
export function getPid(embed, product_page, site, country) {
  if (
    product_page &&
    product_page.match(
      /^https:\/\/www\.[a-zA-Z0-9.-]+\/product\/[a-zA-Z0-9-]+\/[0-9]+_[a-zA-Z]+\/$/
    )
  ) {
    const pid = extractPIDFromProductPage(product_page);
    if (pid) {
      console.log(`Got pid from product page: ${pid}`);
      return pid;
    }
  }

  const pidOrSkuFieldIndex = embed.fields.findIndex((field) => {
    const fieldName = field.name.toLowerCase();
    return fieldName.includes("pid") || fieldName.includes("sku");
  });

  if (pidOrSkuFieldIndex !== -1) {
    const pidOrSkuField = embed.fields[pidOrSkuFieldIndex];
    const pidFinal = extractPID(pidOrSkuField.value);

    if (!isNaN(pidFinal)) {
      if (site !== null) {
        console.log(
          `Got pid from pid/sku field: ${pidFinal}_${site}${country}`
        );
        return `${pidFinal}_${site}${country}`.toLocaleLowerCase();
      }
    } else {
      return pidFinal;
    }
  }

  return null;
}

/**
 * Possibily returns the store from either the username or the title
 * @param {*} username
 * @param {*} title
 * @returns
 */
export function getStoreParams(username, title) {
  return username.includes("Nootify")
    ? parseUsername(title)
    : parseUsername(username);
}

/**
 * Parses the username to try and get the store name. As the username of the bot can also have a link included, it will try to get the store name from the username as well as the link.
 * @param {string} str
 * @returns {string | null}
 */
function parseUsername(str) {
  const lowerStr = str.toLowerCase();

  // Check if lowerStr contains a match
  for (const key of Object.keys(WEBSITE_KEYS)) {
    if (lowerStr.includes(key)) {
      return WEBSITE_KEYS[key];
    }
  }

  // Check if the URL contains a match
  const urlMatch = str.match(/https:\/\/(?:www\.)?([\w.]+)\//);
  if (urlMatch) {
    let domain = urlMatch[1].replace(/\s|\.|www\./g, ""); // Remove spaces and points from the domain
    for (const key of Object.keys(WEBSITE_KEYS)) {
      const keyWithoutSpaces = key.replace(/\s/g, ""); // Remove spaces from the key
      if (domain.includes(keyWithoutSpaces)) {
        return WEBSITE_KEYS[key];
      }
    }
  }

  return null;
}

export function handleStore(store, country) {
  switch (`${store}${country}`.toLowerCase()) {
    case "sizeuk":
    case "sizegb":
      return "size";

    default:
      return `${store}${country}`.toLowerCase();
  }
}

export function getSiteFromProductPage(productPage) {
  try {
    if (!productPage || typeof productPage !== 'string') {
      return null;
    }
    
    const url = new URL(productPage);
    const hostname = url.hostname;
    
    // Retourner null au lieu de "undefined" + suffixe
    if (!hostname || hostname === 'undefined') {
      return null;
    }
    
    return hostname.replace('www.', '');
  } catch (error) {
    console.log(`Error parsing site from product page: ${error.message}`);
    return null;
  }
}
