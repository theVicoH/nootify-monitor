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
import fetch from "node-fetch";
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

/**
 * @description Sends requests to cybersole service for each available size
 * @param {string} productUrl - The product URL
 * @param {Array<string>} sizes - Array of available sizes
 */
async function sendToCybersole(productUrl, sizes) {
  console.log('=== CYBERSOLE REQUEST START ===');
  console.log('Product URL:', productUrl);
  console.log('Available sizes:', sizes);
  
  if (!sizes || sizes.length === 0) {
    console.log('❌ No sizes available for cybersole request');
    return;
  }

  const cybersoleUrl = 'http://89.33.194.104:3000/process';
  console.log('Cybersole endpoint:', cybersoleUrl);
  
  // Function to round sizes with .3 and .8
  function roundSize(size) {
    const sizeStr = size.toString();
    
    // Check if size ends with .3 or .8
    if (sizeStr.includes('.3')) {
      // Round down for .3 (e.g., 8.3 -> 8)
      const rounded = Math.floor(parseFloat(sizeStr));
      console.log(`📐 Rounding size ${size} down to ${rounded}`);
      return rounded.toString();
    } else if (sizeStr.includes('.8')) {
      // Round up for .8 (e.g., 8.8 -> 9)
      const rounded = Math.ceil(parseFloat(sizeStr));
      console.log(`📐 Rounding size ${size} up to ${rounded}`);
      return rounded.toString();
    }
    
    // Return original size if no rounding needed
    return size;
  }
  
  for (const size of sizes) {
    try {
      const roundedSize = roundSize(size);
      
      const payload = {
        store: "Asphaltgold",
        link: productUrl,
        size: roundedSize
      };

      console.log(`🚀 Sending cybersole request for size ${size} (rounded to ${roundedSize}):`);
      console.log('Payload:', JSON.stringify(payload, null, 2));
      console.log('Request URL:', cybersoleUrl);
      console.log('Request method: POST');
      console.log('Content-Type: application/json');

      const startTime = Date.now();
      const response = await fetch(cybersoleUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      const endTime = Date.now();
      
      console.log(`⏱️ Request took ${endTime - startTime}ms`);
      console.log(`📊 Response status: ${response.status} ${response.statusText}`);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const result = await response.text();
        console.log(`✅ Cybersole request successful for size ${size} (rounded to ${roundedSize})`);
        console.log('Response body:', result);
      } else {
        const errorBody = await response.text();
        console.error(`❌ Cybersole request failed for size ${size} (rounded to ${roundedSize}):`);
        console.error('Status:', response.status, response.statusText);
        console.error('Error body:', errorBody);
      }
    } catch (error) {
      console.error(`💥 Error sending cybersole request for size ${size}:`);
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      
      if (error.code) {
        console.error('Error code:', error.code);
      }
      if (error.errno) {
        console.error('Error errno:', error.errno);
      }
    }
  }
  
  console.log('=== CYBERSOLE REQUEST END ===');
}

/**
 * @description Handles messages from DUSTIFY_SPOTIFY_EU_2 channel, only processing asphaltgold.com links
 * @param {*} m
 */
export async function handleSpotifyEu2Msg(m) {
  if (!isMessageEmbeded(m)) {
    return;
  }

  const embedMsg = m.embeds[0];
  
  // Parse the message to get product details
  const embedDetails = await parseMessage(m);
  
  // Check if the product page contains asphaltgold.com
  if (!embedDetails?.product_page || !embedDetails.product_page.includes('asphaltgold.com')) {
    console.log(`Skipping message ${m.id} - not from asphaltgold.com`);
    return;
  }
  
  console.log(`Processing asphaltgold.com message ${m.id}`);
  
  // Send original embed to webhook
  await sendEmbedToWebhook(process.env.WEBHOOK_URL, embedMsg);

  // Try to get additional details, but handle the case where it fails
  let sku = null;
  let sizesAvailable = embedDetails?.sizes || [];
  let price = embedDetails?.price;

  try {
    const additionalDetails = await getAdditionalDetails(
      embedDetails?.pid,
      embedDetails?.store,
      embedDetails?.site,
      getBrandFromProductPage(embedDetails?.product_page),
      embedDetails?.thumbnail
    );

    if (additionalDetails) {
      sku = additionalDetails.sku;
      sizesAvailable = additionalDetails.sizesAvailable || embedDetails?.sizes || [];
      price = additionalDetails.price || embedDetails?.price;
    }
  } catch (error) {
    console.log('Error getting additional details, using parsed data:', error);
  }

  embedDetails.price = price;

  // Send requests to cybersole for each available size
  await sendToCybersole(embedDetails.product_page, sizesAvailable);

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

  console.log("parsedEmbedMsg for asphaltgold:", parsedEmbedMsg);

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
  }
}

export function isStoreHandled(store) {
  return CURRENT_HANDLED_WEBSITES.includes(store);
}
