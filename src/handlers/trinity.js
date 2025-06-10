import fetch from "node-fetch";
import {
  getBrandFromProductPage,
  getGenderFromProductPage,
  getSizeMetricOriginFromSize,
} from "../utils/parsers.js";
import { checkIfWorthBuying } from "./profitChecker.js";
import { SendTelegramMessage } from "../utils/telegram.js";
import {
  SendAPAtemptWebhook,
  SendAPResultWebhook,
  SendNewProfitWebhook,
  SendWorthWebhook,
} from "../utils/webhooks.js";
import { defaultProfitRes } from "../utils/index.js";

export const sendToTrinity = async (
  pid,
  price,
  store,
  thumbnail,
  product_page,
  sku,
  sizes
) => {
  if (!price) {
    price = await getPrice(pid, store);
  }

  if (!sizes || !sizes.length) {
    await sendToTrinitySingle(
      pid,
      price,
      store,
      thumbnail,
      product_page,
      sku,
      null
    );
    return;
  }

  let profitableSizes = [];

  for (const size of sizes) {
    const profitRes = await sendToTrinitySingle(
      pid,
      price,
      store,
      thumbnail,
      product_page,
      sku,
      size
    );

    if (profitRes) {
      profitableSizes.push({
        ...profitRes,
        size: size,
      });
    } else {
      profitableSizes.push({
        ...defaultProfitRes,
        size: size,
      });
    }
  }

  sendNewProfitNotification(
    store,
    product_page,
    sku,
    thumbnail,
    pid,
    price,
    profitableSizes
  );
};

/**
 * Gets the price for a product from trinity.
 * @param {string} pid
 * @param {string} store
 * @returns {Promise<number>}
 */
export async function getPrice(pid, store) {
  try {
    const payload = {
      mainPid: pid,
      store: store,
    };

    const urlTrinityPrice = `${process.env.TRINITY_URL}/mesh/backend/price`;

    console.log(
      `Sending payload ${JSON.stringify(payload)} to ${urlTrinityPrice}`
    );

    console.log(
      `Getting price for ${pid} from ${store} from ${urlTrinityPrice}.`
    );
    const res = await fetch(urlTrinityPrice, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TRINITY_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.text();

    if (res.status !== 200) {
      console.log(`Error sending to trinity: ${res.status} :: ${data}`);
      return null;
    }

    console.log(`Got response from ${urlTrinityPrice} : "${data}"`);
    return parseInt(data);
  } catch (error) {
    console.log(error);
  }
}

async function sendToTrinitySingle(
  pid,
  price,
  store,
  thumbnail,
  product_page,
  sku,
  size
) {
  let profitRes = null;
  try {
    const payload = {
      mainPid: pid,
      size: size || "random", // In case of size == undefined, send empty string
      storeName: store,
      sku: sku || "", // In case of sku == undefined, send empty string
      autoCheckout: false,
    };

    if (!guardClauseTrinity(payload)) {
      console.log("Error: Invalid payload");
      console.log(payload);
      return null;
    }

    console.log(
        `Sending to trinity payload: ${JSON.stringify(
          payload
        )} from func arguments: pid:"${pid}" price:"${price}" store:"${store}" product_page:"${product_page}" sku:"${sku}" size:"${size}"`
    );

    profitRes = await checkIfWorthBuying(
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

    if (!profitRes) {
      console.log("Error: Invalid profit response");
    } else {
      console.log(`Worth buying ${product_page}? => ${profitRes?.worth}`);
      console.log(
        `Profit: ${
          profitRes?.benefit / 100
        }. Original price:${price} -- Resold at ${
          profitRes?.price / 100
        } sized ${profitRes?.size}`
      );

      // payload.autoCheckout = profitRes?.worth === "CERTAIN GAIN" || false;
      payload.worth = profitRes?.worth;
    }

    sendMessageBasedOnWorth(
      profitRes,
      thumbnail,
      product_page,
      sku,
      pid,
      price,
      size
    );

    console.log(
      `Sending payload ${JSON.stringify(
        payload
      )} to ${`${process.env.TRINITY_URL}/mesh/backend`}`
    );

    const [res] = await Promise.all([
      fetch(`${process.env.TRINITY_URL}/mesh/backend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.TRINITY_TOKEN}`,
        },
        body: JSON.stringify(payload),
      }),
    ]);

    const uuid_session = await res.text();

    console.log(
      `Trinity response (${res.status}) for ${pid}: ${JSON.stringify(
        uuid_session
      )}`
    );

    if (res.status !== 200) {
      console.log(`Error sending to trinity: ${res.status}`);
      return profitRes;
    }

    // if (profitRes?.worth === "CERTAIN GAIN") {
    //   await sendPayAPReqToTrinity(
    //     profitRes,
    //     product_page,
    //     sku,
    //     pid,
    //     price,
    //     size,
    //     uuid_session
    //   );
    // }

    return profitRes;
  } catch (error) {
    console.log(error);
    return profitRes;
  }
}

async function sendPayAPReqToTrinity(
  profitRes,
  product_page,
  sku,
  pid,
  price,
  size,
  uuid_session
) {
  sendAPAtemptWebhook(
    profitRes,
    product_page,
    sku,
    pid,
    price,
    size,
    uuid_session
  );
  const url = `${process.env.TRINITY_URL}/mesh/backend/pay?isAP=true`;
  const payload = {
    uuid_session,
  };

  console.log(`AP request to trinity with payload: ${JSON.stringify(payload)}`);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.TRINITY_TOKEN}`,
    },
    body: JSON.stringify(payload),
  });

  if (res.status !== 200) {
    console.log(`Error sending AP request to trinity: ${res.status}`);
  }

  const data = await res.text();

  console.log(
    `AP request response from trinity: ${data}, status: ${res.status}`
  );

  sendAPResultWebhook(
    profitRes,
    product_page,
    sku,
    pid,
    price,
    size,
    res.status,
    uuid_session
  );
  return res;
}

/**
 * Quality control for the restock object sent to trinity
 * @param {*} payload
 * @returns
 */
function guardClauseTrinity(restock) {
  if (!restock?.mainPid.match(/^\d+_[a-zA-Z]+$/)) {
    return false;
  }

  if (!restock?.storeName) {
    return false;
  }

  return true;
}

function sendMessageBasedOnWorth(
  profitRes,
  thumbnail,
  product_page,
  sku,
  pid,
  price,
  size
) {
  console.log(
    `Sending sneaker ${
      sku || pid
    } worth to profit checker webhook... (${JSON.stringify(
      profitRes
    )} ${product_page}, ${sku}, ${pid}, ${price}, ${size})`
  );
  if (!profitRes) {
    return;
  }
  const messageEnd = `Meilleure offre ${profitRes?.best_offer / 100}€(${
    profitRes?.offer_reseller
  }) || Meilleure mediane des dernières ventes ${profitRes?.best_sell / 100}€(${
    profitRes?.median_reseller
  }) en taille ${profitRes?.size}.\n`;
  let message;

  switch (profitRes?.worth) {
    case "CERTAIN GAIN":
      message =
        "Il semblerait qu'il y ait CERTAINEMENT un bénéfice avec cette paire : ";
      break;

    case "ALMOST CERTAIN GAIN":
      message =
        "Il semblerait qu'il y ait PRESQUE CERTAINEMENT un bénéfice avec cette paire : ";
      break;

    case "PROBABLE GAIN":
      message =
        "Il semblerait qu'il y ait PROBABLEMENT un bénéfice avec cette paire : ";
      break;

    case "CONSUMER GAIN":
      message =
        "Il semblerait qu'il y ait un bénéfice que pour le consommateur avec cette paire : ";
      return;

    default:
      message =
        "Il semblerait qu'il y n'ait pas de bénéfice à faire avec cette paire : ";
      return;
  }

  SendWorthWebhook(
    message,
    thumbnail,
    product_page,
    sku,
    pid,
    price,
    size,
    messageEnd,
    profitRes?.benefit / 100,
    profitRes?.logs,
    profitRes?.worth
  );

  console.log(`Sent sneaker ${sku || pid} to profit checker webhook`);
}

function sendNewProfitNotification(
  store,
  product_page,
  sku,
  thumbnail,
  pid,
  price,
  profitableSizes
) {
  console.log(
    `Sending new profit notification for ${product_page} (SKU:${sku} PID:${pid})`
  );

  const message = `Nouvelles opportunités de profit pour le sneaker ${product_page} (SKU:${sku} PID:${pid}) sur ${store}.\n`;

  SendNewProfitWebhook(
    message,
    store,
    thumbnail,
    product_page,
    sku,
    pid,
    price,
    profitableSizes
  );
}

function sendAPAtemptWebhook(
  profitRes,
  product_page,
  sku,
  pid,
  price,
  size,
  uuid_session
) {
  console.log(
    `Sending AP Atempt webhook for ${product_page} (SKU:${sku} PID:${pid} Taille:${size})`
  );

  const message = `Tentative d'achat automatique pour le sneaker ${product_page} (SKU:${sku} PID:${pid} Taille:${size}) avec un bénéfice de ${
    profitRes?.benefit / 100
  }€. Prix d'origine : ${price}€. UUID de la session : ${uuid_session}`;

  SendAPAtemptWebhook(message, uuid_session);
}

function sendAPResultWebhook(
  profitRes,
  product_page,
  sku,
  pid,
  price,
  size,
  status,
  uuid_session
) {
  console.log(
    `Sending AP Result webhook for ${product_page} (SKU:${sku} PID:${pid} Taille:${size})`
  );

  const message = `${
    status === 200 ? "**SUCCÈS**" : "**ÉCHEC**"
  } d'achat automatique pour le sneaker ${product_page} (SKU:${sku} PID:${pid} Taille:${size}) avec un bénéfice de ${
    profitRes?.benefit / 100
  }€. Prix d'origine : ${price}€. UUID de la session : ${uuid_session}`;

  SendAPResultWebhook(message, uuid_session);
}
