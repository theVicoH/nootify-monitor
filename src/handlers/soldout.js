import fetch from "node-fetch";
import {
  getBrandFromProductPage,
  getGenderFromProductPage,
  getSizeMetricOriginFromSize,
} from "../utils/parsers.js";
import { sendTokenExpiredWebhook } from "../utils/webhooks.js";
import { checkIfWorthBuying } from "./profitChecker.js";

export async function sendToWebsiteAPI(
  pid,
  sku,
  thumbnail,
  price,
  product_name,
  product_page,
  currency,
  site,
  country,
  sizes,
  store
) {
  if (sizes && sizes.length) {
    sizes.map(async (size) => {
      sendRestockAlert(
        pid,
        sku,
        thumbnail,
        price,
        product_name,
        product_page,
        currency,
        site,
        country,
        size,
        store
      );
    });
  } else {
    console.log(`Found no sizes available for ${product_page} ${pid} ${sku}`);
  }

  return null; // Successful request, return null to indicate success
}

async function sendRestockAlert(
  pid,
  sku,
  thumbnail,
  price,
  product_name,
  product_page,
  currency,
  site,
  country,
  size,
  store
) {
  try {
    const payload = {
      restock: {
        pid: pid,
        sku: sku,
        uuid_session: "0",
        payment_site: "adyen",
        commission: 1000,
        size: size,
        thumbnail: thumbnail,
        price: +price * 100,
        product_name: product_name,
        product_page: product_page,
        site: site,
        is_carted: false,
        currency: currency,
        country: country,
      },
    };

    if (!guardClauseRestockSO(payload)) {
      console.log("Restock to SO Payload failed guard clause");
      console.log(payload);
      return;
    }

    if (price > 0) {
      const profitRes = await checkIfWorthBuying(
        sku,
        pid,
        store,
        product_page,
        getBrandFromProductPage(product_page),
        size,
        getGenderFromProductPage(product_page),
        getSizeMetricOriginFromSize(size),
        price
      );

      payload.restock.size = profitRes?.size
        ? profitRes?.size
        : payload.restock.size;

      console.log(
        `Profit: ${profitRes?.benefit}. Original price:${price} -- Resold at ${profitRes?.price} sized ${profitRes?.size}`
      );

      if (!profitRes?.is_worth_showing) {
        console.log("Not worth showing");
        return;
      }
    }

    console.log("Sending to website api");
    console.log(payload);

    const res = await fetch(`${process.env.SO_API_URL}/api/restocks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SO_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (res.status !== 201) {
      console.log(
        `${res.status} error sending to website api ${sku || pid} ${size}`
      );
      if (res.status == 401) {
        await sendTokenExpiredWebhook();
      }
    }
  } catch (error) {
    console.log(error);
  }
}

/**
 * Quality control for the restock object sent to the website API
 * @param {*} payload
 * @returns
 */
function guardClauseRestockSO({ restock }) {
  const {
    pid,
    sku,
    thumbnail,
    product_name,
    product_page,
    site,
    currency,
    country,
  } = restock;

  if (!pid.match(/^\d+_[a-zA-Z]+$/) && !sku) {
    return false;
  }
  if (!thumbnail.match(/^https?:\/\//)) {
    return false;
  }
  if (
    !product_page.match(
      /^https:\/\/www\.[a-zA-Z0-9.-]+\/product\/[a-zA-Z0-9-]+\/[0-9a-zA-Z_]+\/$/
    )
  ) {
    return false;
  }
  if (!product_name && !site && !currency && !country) {
    return false;
  }

  return true;
}
