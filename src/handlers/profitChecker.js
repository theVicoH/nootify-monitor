import fetch from "node-fetch";
import { PROFIT_CHECKER_HANDLED_BRANDS } from "../globals/constants.js";
import { isStoreHandled } from "./index.js";

/**
 * Sends a request to the profit checker to check if the product is worth buying.
 * @param {string} pid
 * @param {string} store
 * @param {string} brand
 * @param {string} size
 * @param {string} gender
 * @param {string} size_metric_origin
 * @param {integer} retail_price
 * @returns {Promise<boolean|null>}
 */
export async function checkIfWorthBuying(
  sku,
  pid,
  store,
  product_page,
  brand,
  size,
  gender,
  sizeMetric,
  price
) {
  try {
    console.log(`Checking if worth buying sku:"${sku}"...`);

    if (!profitCheckerGuardClause(price, sku)) {
      console.log(
        `Profit checker guard clause failed for sku:"${sku}" -- price:"${price}".`
      );
      return;
    }

    const urlWorthBuying = `${process.env.PROFIT_CHECKER_URL}/getPrice`;
    const payload = {
      sku: sku,
      pid: pid,
      website: store,
      product_page: product_page,
      size: size,
      brand: brand,
      gender: gender,
      size_metric_origin: sizeMetric,
      retail_price: price * 100,
    };

    console.log(`Sending ${JSON.stringify(payload)} to ${urlWorthBuying}`);

    const res = await fetch(urlWorthBuying, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PROFIT_CHECKER_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    console.log(`Profit checker response for ${sku}: ${JSON.stringify(json)}}`);
    return json;
  } catch (error) {
    if (error.code === "ENOTFOUND") {
      console.log(`Profit checker service unavailable: ${error.message}`);
      return null; // ou un objet par défaut
    }
    console.log(`Profit checker error: ${error.message}`);
    return null;
  }
}

/**
 *
 * @param {string} pid
 * @param {string} store
 * @returns {Promise<Array<string>|null>}
 */
export async function getSizesAvailable(pid, store) {
  console.log(
    `Getting sizes available for pid:"${pid}" from store:"${store}"...`
  );

  if (guardClauseGetSizesAvailable(pid, store) && !isStoreHandled(store)) {
    console.log(
      `Can't get sizes available, missing a variable -- pid:"${pid}" store:"${store}"`
    );
    return;
  }

  try {
    const urlSizesAvailable = `${process.env.PROFIT_CHECKER_URL}/getMeshProduct`;
    const payload = {
      pid,
      website: store,
    };

    console.log(`Sending ${JSON.stringify(payload)} to ${urlSizesAvailable}`);

    const res = await fetch(urlSizesAvailable, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PROFIT_CHECKER_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (res?.status !== 200) {
      throw new Error(
        `Error while getting sizes available for pid ${pid}. Status code: ${
          res.status
        } -- ${JSON.stringify(json)}`
      );
    }

    console.log(`Profit checker response for ${pid}: ${JSON.stringify(json)}}`);

    return json?.map((size) => {
      return size.size;
    });
  } catch (error) {
    console.log(error);
    return;
  }
}

function guardClauseGetSizesAvailable(pid, store) {
  return !pid || !store;
}

/**
 * Converts a PID to a SKU using the profit checker API
 * @param {string} pid ProductID
 * @param {string} website handled website
 * @param {string} brand nike
 * @returns {Promise<string|null>}
 */
export async function convertPIDToSKU(pid, website, brand, thumbnail) {
  console.log(`Converting PID ${pid} to SKU...`);
  if (guardClauseConvertPIDtoSKU(pid, website)) {
    console.log(
      `Can't convert pid to sku, missing a variable -- pid:"${pid}" website:"${website}" brand:"${brand}"`
    );
    return;
  }
  try {
    const urlConverter = `${process.env.PROFIT_CHECKER_URL}/convertPID`;
    const payload = {
      pid,
      website,
      brand: brand || "",
      image: thumbnail,
    };

    console.log(`Sending ${JSON.stringify(payload)} to ${urlConverter}`);

    const res = await fetch(urlConverter, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PROFIT_CHECKER_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    switch (res?.status) {
      case 200:
        const json = await res.json();
        console.log(
          `Got response from profit checker API: ${
            res.status
          } :: ${JSON.stringify(json)}`
        );
        return json?.sku;
      default:
        const text = await res.text();
        throw new Error(
          `Error while converting PID ${pid} to SKU. Status code: ${res.status} -- ${text}`
        );
    }
  } catch (error) {
    console.log(error);
    return;
  }
}

/**
 * Sends false if there is no pid or website.
 * @param {string} pid
 * @param {string} website
 * @returns {boolean}
 */
function guardClauseConvertPIDtoSKU(pid, website) {
  return !pid || !website;
}

function profitCheckerGuardClause(retail_price, sku) {
  if (retail_price === 0) {
    return false;
  }

  if (!sku) {
    return false;
  }

  return true;
}

export async function getAdditionalDetails(pid, store, website, brand, thumbnail) {
  console.log(
    `Getting additional details for ${JSON.stringify({
      pid,
      store,
      website,
      brand,
      thumbnail,
    })}`
  );

  if (guardClauseConvertPIDtoSKU(pid, website)) {
    console.log(
      `Can't convert pid to sku, missing a variable -- pid:"${pid}" website:"${website}" brand:"${brand}"`
    );
    return;
  }

  if (guardClauseGetSizesAvailable(pid, store) && !isStoreHandled(store)) {
    console.log(
      `Can't get sizes available, missing a variable -- pid:"${pid}" store:"${store}"`
    );
    return;
  }

  try {
    const urlAdditionalDetails = `${process.env.PROFIT_CHECKER_URL}/getMeshAdditionalDetails`;
    const payload = {
      pid,
      website: store,
      brand: brand || "",
      image: thumbnail,
    };

    console.log(
      `Sending ${JSON.stringify(payload)} to ${urlAdditionalDetails}`
    );

    const res = await fetch(urlAdditionalDetails, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PROFIT_CHECKER_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (res?.status !== 200) {
      throw new Error(
        `Error while getting sizes available for pid ${pid}. Status code: ${
          res.status
        } -- ${JSON.stringify(json)}`
      );
    }

    console.log(`Profit checker response for ${pid}: ${JSON.stringify(json)}}`);

    return {
      sizesAvailable: json?.sizes,
      sku: json?.sku,
      price: parseInt(json?.price),
    };
  } catch (error) {
    console.log(error);
    return;
  }
}
