/**
 * Every message sent on the channel mesh eu of the hidden society discord server is parsed.
 * As they have little to no consistency, this is a nightmare to parse
 * Most of the parser functions will go step by step into each of the fields in which there is a possibility of finding the information we need and try and find/parse/extract it
 * @param {*} m
 * @returns
 */
export default function parseHSMessage(m) {
  console.log(`Parsing message ${m.id}...`);

  const embed = m.embeds[0];
}
