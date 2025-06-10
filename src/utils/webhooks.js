import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

/**
 * Sends an embed message to a given discord webhook.
 * @param {string} webhook
 * @param {Object} embedMsg
 */
export async function sendEmbedToWebhook(webhook, embedMsg) {
  try {
    console.log(`Sending embed ${JSON.stringify(embedMsg)} to webhook...`);

    const res = await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        embeds: [embedMsg],
        attachments: [],
      }),
    });

    if (res.status !== 204) {
      const bodyRes = await res.text();
      throw new Error(
        `Unexpected response ${res.status} ${res.statusText} :: ${bodyRes}`
      );
    }
  } catch (error) {
    console.log(`Error sending embed to webhook: ${error}`);
  }
}

export function parseDetailsToEmbed(parsedMsg) {
  const embedParsedMsg = {
    title: `Parsed ${parsedMsg?.product_name}`,
    url: parsedMsg?.product_page,
    timestamp: new Date().toISOString(),
    footer: {
      text: "SO Restock Monitors",
    },
    thumbnail: {
      url:
        parsedMsg?.thumbnail ||
        "https://sold-out.io/assets/sneaker_placeholder.webp",
    },
    color: parsedMsg?.sku ? 0x55aa55 : 0xff5555,
    fields: [
      {
        name: "Site",
        value: parsedMsg?.site || parsedMsg?.store || "Not found",
        inline: true,
      },
      {
        name: "PID",
        value: parsedMsg?.pid || "Not found",
        inline: true,
      },
      {
        name: "SKU",
        value: parsedMsg?.sku || "Not found",
        inline: true,
      },
      {
        name: "Country",
        value: parsedMsg?.country || "Not found",
      },
      {
        name: "Price",
        value: parsedMsg?.price || "Not found",
        inline: true,
      },
      {
        name: "Currency",
        value: parsedMsg?.currency || "Not found",
        inline: true,
      },
      {
        name: "Sizes",
        value:
          (parsedMsg?.sizes && parsedMsg?.sizes.join(" & ")) || "Not found",
      },
    ],
  };

  return embedParsedMsg;
}

export async function sendTokenExpiredWebhook() {
  try {
    console.log(`Sending token expired message to webhook...`);

    const res = await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content:
          "<@&1029371289997164555> Website API Token expired on nootify-monitor",
        embeds: null,
        attachments: [],
      }),
    });

    if (res.status !== 204) {
      const bodyRes = await res.text();
      throw new Error(
        `Unexpected response ${res.status} ${res.statusText} :: ${bodyRes}`
      );
    }
  } catch (error) {
    console.log(`Error sending embed to webhook: ${error}`);
  }
}

export async function SendWorthWebhook(
  message,
  thumbnail,
  product_page,
  sku,
  pid,
  price,
  size,
  messageEnd,
  profit,
  logs,
  worth
) {
  try {
    console.log(`Sending sneaker worth to webhook...`);

    const {
      stockXBestMedian,
      stockXBestOffer,
      aliasBestMedian,
      aliasBestOffer,
    } = parsePFLogs(logs);

    const body = JSON.stringify({
      content: null,
      embeds: [
        {
          title: product_page,
          description: message + messageEnd,
          color: null,
          fields: [
            {
              name: "SKU",
              value: `${sku}`,
              inline: true,
            },
            {
              name: "PID",
              value: `${pid}`,
              inline: true,
            },
            {
              name: "Taille",
              value: `${size}`,
              inline: true,
            },
            {
              name: "Prix",
              value: `${price}`,
              inline: true,
            },
            {
              name: "Bénéfice",
              value: `${profit}`,
              inline: true,
            },
            {
              name: "   ",
              value: "   ",
            },
            {
              name: "StockX",
              value: `Median: ${stockXBestMedian} \nOffer: ${stockXBestOffer}`,
              inline: true,
            },
            {
              name: "Alias",
              value: `Median: ${aliasBestMedian} \nOffer: ${aliasBestOffer}`,
              inline: true,
            },
          ],
          thumbnail: {
            url: thumbnail,
          },
        },
      ],
      attachments: [],
    });

    let url;

    switch (worth) {
      case "CERTAIN GAIN":
        url = process.env.WEBHOOK_URL_WORTH_CERTAIN_GAIN;
        break;
      case "PROBABLE GAIN":
        url = process.env.WEBHOOK_URL_WORTH_PROBABLE_GAIN;
        break;
    }

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    if (res.status !== 204) {
      const bodyRes = await res.text();
      throw new Error(
        `Unexpected response ${res.status} ${res.statusText} :: ${bodyRes}`
      );
    }
  } catch (e) {
    console.log(`Error sending embed to webhook: ${e}`);
  }
}

function parsePFLogs(message) {
  console.log(`Parsing PF logs from message:\n${message}...`);

  // Regular expressions to match the desired values from the new format
  const stockXRegex = /StockX:\s*Best Median:\s*([\d.]+|NOT FOUND)\s*Best Offer:\s*([\d.]+|NOT FOUND)/;
  const aliasRegex = /Alias:\s*Best Median:\s*([\d.]+|NOT FOUND)\s*Best Offer:\s*([\d.]+|NOT FOUND)/;

  // Execute the regex to extract values
  const stockXMatch = stockXRegex.exec(message);
  const aliasMatch = aliasRegex.exec(message);

  // Helper function to parse or handle "NOT FOUND"
  const parseValue = (value) => (value === "NOT FOUND" ? null : parseFloat(value));

  // Parse and store the values in variables
  const stockXBestMedian = stockXMatch ? parseValue(stockXMatch[1]) : null;
  const stockXBestOffer = stockXMatch ? parseValue(stockXMatch[2]) : null;

  const aliasBestMedian = aliasMatch ? parseValue(aliasMatch[1]) : null;
  const aliasBestOffer = aliasMatch ? parseValue(aliasMatch[2]) : null;

  console.log(
    `Parsed PF logs: StockX: Best Median: ${stockXBestMedian}, Best Offer: ${stockXBestOffer}, Alias: Best Median: ${aliasBestMedian}, Best Offer: ${aliasBestOffer}`
  );

  // Return the results
  return {
    stockXBestMedian,
    stockXBestOffer,
    aliasBestMedian,
    aliasBestOffer,
  };
}


export async function SendAPAtemptWebhook(message) {
  try {
    console.log(`Sending sneaker worth to webhook...`);

    const res = await fetch(process.env.WEBHOOK_URL_ATTEMPT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: message,
        embeds: null,
        attachments: [],
      }),
    });

    if (res.status !== 204) {
      const bodyRes = await res.text();
      throw new Error(
        `Unexpected response ${res.status} ${res.statusText} :: ${bodyRes}`
      );
    }
  } catch (e) {
    console.log(`Error sending embed to webhook: ${error}`);
  }
}

export async function SendAPResultWebhook(message) {
  try {
    console.log(`Sending sneaker worth to webhook...`);

    const res = await fetch(process.env.WEBHOOK_URL_ATTEMPT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: message,
        embeds: null,
        attachments: [],
      }),
    });

    if (res.status !== 204) {
      const bodyRes = await res.text();
      throw new Error(
        `Unexpected response ${res.status} ${res.statusText} :: ${bodyRes}`
      );
    }
  } catch (e) {
    console.log(`Error sending embed to webhook: ${error}`);
  }
}

export async function SendNewProfitWebhook(
  message,
  store,
  thumbnail,
  product_page,
  sku,
  pid,
  price,
  profitableSizes
) {
  try {
    console.log(`Sending sneaker profits to webhook...`);

    let sizeStr = "";
    let bestSellStr = "";
    let bestOfferStr = "";

    profitableSizes.sort((a, b) => parseFloat(b.size) - parseFloat(a.size));

    for (let i = 0; i < profitableSizes.length; i++) {
      sizeStr += `${profitableSizes[i].size} \n`;
      if (profitableSizes[i].best_sell) {
        bestSellStr += `${profitableSizes[i].best_sell / 100}(${getFirstLetter(
          profitableSizes[i].median_reseller
        )})\n`;
      } else {
        bestSellStr += `Not found\n`;
      }
      if (profitableSizes[i].best_offer) {
        bestOfferStr += `${
          profitableSizes[i].best_offer / 100
        }(${getFirstLetter(profitableSizes[i].offer_reseller)})\n`;
      } else {
        bestOfferStr += `Not found\n`;
      }
    }

    const body = JSON.stringify({
      content: null,
      embeds: [
        {
          title: product_page,
          description: "",
          color: 14544384,
          fields: [
            {
              name: "GlobalSKU",
              value: `${sku || "Not found"}`,
              inline: true,
            },
            {
              name: "ProductID",
              value: `${pid}`,
              inline: true,
            },
            {
              name: "  ",
              value: "  ",
              inline: true,
            },
            {
              name: "Price",
              value: `${price}`,
              inline: true,
            },
            {
              name: "Store",
              value: store,
              inline: false,
            },
            {
              name: "Sizes",
              value: sizeStr,
              inline: true,
            },
            {
              name: "Best Sell",
              value: bestSellStr,
              inline: true,
            },
            {
              name: "Best Offer",
              value: bestOfferStr,
              inline: true,
            },
          ],
          thumbnail: {
            url: thumbnail,
          },
        },
      ],
      attachments: [],
    });

    const res = await fetch(process.env.WEBHOOK_URL_NEW_PROFIT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    if (res.status !== 204) {
      const bodyRes = await res.text();
      throw new Error(
        `Unexpected response ${res.status} ${res.statusText} :: ${bodyRes}`
      );
    }
  } catch (e) {
    console.log(`Error sending embed to webhook: ${error}`);
  }
}

function getFirstLetter(s) {
  if (s.length === 0) {
    return ""; // Return empty string if input is empty
  }
  return s.charAt(0); // Get the first character of the string
}
