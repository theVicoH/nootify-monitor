import { unfurlProductURL } from "../utils/index.js";
import { parsePID } from "../utils/parsers.js";
import {
  getCountry,
  getEmbedAuthor,
  getMessageAuthor,
  getPid,
  getPrice,
  getProductName,
  getProductPage,
  getSite,
  getSiteTLD,
  getSizes,
  getStoreTLD,
  getStoreParams,
  handleStore,
} from "./parsers/index.js";

/**
 * Every message sent on the channel meshbckup of the nootify discord server is parsed.
 * As they have little to no consistency, this is a nightmare to parse
 * Most of the parser functions will go step by step into each of the fields in which there is a possibility of finding the information we need and try and find/parse/extract it
 * @param {*} m
 * @returns
 */
export async function parseMessage(m) {
  console.log(`Parsing message ${m.id}...`);
  const embed = m.embeds[0];

  const embedAuthor = getEmbedAuthor(embed);
  const messageAuthor = getMessageAuthor(m);
  const storeParams = getStoreParams(m.author.username, embed.title);

  const product_name = getProductName(embed);
  const product_page = await getProductPage(embed);

  const site = getSite(embed, product_page);
  const country = getCountry(
    embed,
    storeParams,
    messageAuthor,
    embedAuthor,
    product_page
  );

  const { price, currency } = getPrice(embed);

  const sizes = getSizes(embed);
  const pidFinal = getPid(embed, product_page, site, country);
  const store = handleStore(site, country);

  const parsedMessage = {
    pid: pidFinal,
    sku: null,
    thumbnail: embed.thumbnail ? embed.thumbnail.url : "none",
    price,
    product_name,
    product_page: product_page,
    currency,
    site: `${site}${country}`.toLowerCase(),
    country,
    sizes,
    store: store,
  };

  console.log(`Parsed message ${m.id}!`);
  console.log(`Got parsed message: ${JSON.stringify(parsedMessage)}`);

  return parsedMessage;
}
