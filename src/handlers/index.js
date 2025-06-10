import {
  getBrandFromProductPage,
  getGenderFromProductPage,
  isMessageEmbeded,
} from "../utils/parsers.js";
import { parseDetailsToEmbed, sendEmbedToWebhook } from "../utils/webhooks.js";
import { sendToTrinity } from "./trinity.js";
import { sendToWebsiteAPI } from "./soldout.js";
import { parseMessage } from "./parseMessage.js";
import {
  CURRENT_HANDLED_WEBSITES,
  HANDLED_WEBSITES,
} from "../globals/websites_allowed.js";

import dotenv from "dotenv";
import {
  convertPIDToSKU,
  getSizesAvailable,
  getAdditionalDetails,
} from "./profitChecker.js";
import { getPrice } from "./trinity.js";
import { parseCybersoleMessage } from "./parsers/cybersole.js";
dotenv.config(); // Load environment variables from .env file

export async function handleHiddenSocietyMsg(m) {
  if (!isMessageEmbeded(m)) {
    return;
  }

  const embedMsg = m.embeds[0];
  await sendEmbedToWebhook(process.env.WEBHOOK_URL, embedMsg);

  const embedDetails = await parseHSMessage(m);
}

/**
 * @description Parses the message and sends it to the discord webhook, to the website API & to trinity
 * @param {*} m
 */
export async function handleMeshBackupMsg(m) {
  if (!isMessageEmbeded(m)) {
    return;
  }

  const embedMsg = m.embeds[0];
  await sendEmbedToWebhook(process.env.WEBHOOK_URL, embedMsg);

  const embedDetails = await parseMessage(m);

  const { sku, sizesAvailable, price } = await getAdditionalDetails(
    embedDetails?.pid,
    embedDetails?.store,
    embedDetails?.site,
    getBrandFromProductPage(embedDetails?.product_page),
    embedDetails?.thumbnail
  );

  embedDetails.price = price;

  const parsedEmbedMsg = parseDetailsToEmbed({
    pid: embedDetails?.pid,
    sku,
    thumbnail: embedDetails?.thumbnail,
    price: embedDetails?.price,
    product_name: embedDetails?.product_name,
    product_page: embedDetails?.product_page,
    currency: embedDetails?.currency,
    site: embedDetails?.site,
    country: embedDetails?.country,
    sizes: sizesAvailable,
    store: embedDetails?.store,
  });

  console.log("parsedEmbedMsg", parsedEmbedMsg);

  await sendEmbedToWebhook(
    parsedEmbedMsg?.fields.find((field) => field.name == "SKU").value ==
      "Not found"
      ? process.env.WEBHOOK_URL_NO_SKU
      : process.env.WEBHOOK_URL_WITH_SKU,
    parsedEmbedMsg
  );

  if (isStoreHandled(embedDetails?.store)) {
    await sendToTrinity(
      embedDetails?.pid,
      embedDetails?.price,
      embedDetails?.store,
      embedDetails?.thumbnail,
      embedDetails?.product_page,
      sku,
      sizesAvailable
    );
  } else {
    // await sendToWebsiteAPI(
    //   embedDetails?.pid,
    //   sku,
    //   embedDetails?.thumbnail,
    //   embedDetails?.price,
    //   embedDetails?.product_name,
    //   embedDetails?.product_page,
    //   embedDetails?.currency,
    //   embedDetails?.site,
    //   embedDetails?.country,
    //   sizesAvailable,
    //   embedDetails?.store
    // );
  }
}

/**
 * @description Parses the message from the Cybersole server and sends it to the discord webhook, to the website API & to trinity
 * @param {*} m
 */
export async function handleCybersoleMsg(m) {
  if (!isMessageEmbeded(m)) {
    return;
  }

  const embedMsg = m.embeds[0];
  // await sendEmbedToWebhook(process.env.WEBHOOK_URL, embedMsg);

  const embedDetails = await parseCybersoleMessage(m);
}

export function isStoreHandled(store) {
  return CURRENT_HANDLED_WEBSITES.includes(store);
}
