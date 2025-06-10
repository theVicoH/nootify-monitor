import fetch from "node-fetch";
import { LOG_FILENAME } from "../globals/constants.js";
import fs from "fs";
import util from "util";

/**
 * Removes all redirects from the URL and returns the final URL.
 * @param {string} url
 * @returns {Promise<string>}
 */
export async function unfurlProductURL(url) {
  const res = await fetch(url);

  console.log(`Redirected from ${url} to ${res.url} with status ${res.status}`);

  return res.url.split("?")[0];
}

/**
 * Overwrites the console.log function to also write to a log file and add a traceback to the log position in the file.
 */
export function initLogger() {
  var logFile = fs.createWriteStream(LOG_FILENAME, { flags: "a" });
  var logStdout = process.stdout;

  console.log = function () {
    let e = new Error();
    let frame = e.stack.split("\n")[2];
    let path = frame.split(" ").reverse()[0];

    logFile.write(
      `[${new Date().toISOString()}](${path}): ${util.format.apply(
        null,
        arguments
      )}\n`
    );
    logStdout.write(
      `[${new Date().toISOString()}](${path}): ${util.format.apply(
        null,
        arguments
      )}\n`
    );
  };
  console.error = console.log;
}

export const defaultProfitRes = {
  is_worth_buying: false,
  benefit: 0,
  reseller_site: "",
  median_reseller: "",
  offer_reseller: "",
  price: 0,
  size: "",
  worth: "",
  best_sell: 0,
  best_offer: 0,
  logs: "",
};