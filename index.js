import { initLogger } from "./src/utils/index.js";
initLogger();

import { client, gateway } from "./src/services/selcore.js";
import channels from "./src/globals/channels.js";
import {
  handleCybersoleMsg,
  handleMeshBackupMsg,
} from "./src/handlers/index.js";
import { SendTelegramMessage } from "./src/utils/telegram.js";

export var clientSelfcore = client;
var gatewaySelfcore = gateway;

console.log("Starting listening to events...");

gatewaySelfcore.on("message", async (m) => {
  try {
    // if (m.guild_id === channels.HIDDEN_SOCIETY_GUILD_ID) {
    //   switch (m.channel_id) {
    //     case channels.HIDDEN_SOCIETY_MESH_EU_CHANNEL_ID:
    //       await handleMeshBackupMsg(m);
    //       break;

    //     default:
    //       break;
    //   }
    // }
    if (m.guild_id === channels.DUSTIFY_GUILD_ID) {
      switch (m.channel_id) {
        case channels.DUSTIFY_MESH_EU_CHANNEL_ID:
          await handleMeshBackupMsg(m);
          break;
        case channels.DUSTIFY_MESH_UK_CHANNEL_ID:
          await handleMeshBackupMsg(m);
          break;
        case channels.DUSTIFY_MESH_BE_CHANNEL_ID:
          await handleMeshBackupMsg(m);
          break;
        case channels.DUSTIFY_MESH_AT_CHANNEL_ID:
            await handleMeshBackupMsg(m);
            break;
        case channels.DUSTIFY_MESH_DE_CHANNEL_ID:
          await handleMeshBackupMsg(m);
          break;
        case channels.DUSTIFY_MESH_DK_CHANNEL_ID:
          await handleMeshBackupMsg(m);
          break;
        case channels.DUSTIFY_MESH_ES_CHANNEL_ID:
          await handleMeshBackupMsg(m);
          break;
        case channels.DUSTIFY_MESH_FI_CHANNEL_ID:
          await handleMeshBackupMsg(m);
          break;
        case channels.DUSTIFY_MESH_FR_CHANNEL_ID:
          // TRINITY REQUEST
          await handleMeshBackupMsg(m);
          break;
        case channels.DUSTIFY_MESH_IE_CHANNEL_ID:
          await handleMeshBackupMsg(m);
          break;
        case channels.DUSTIFY_MESH_IT_CHANNEL_ID:
          await handleMeshBackupMsg(m);
          break;
        case channels.DUSTIFY_MESH_NL_CHANNEL_ID:
          await handleMeshBackupMsg(m);
          break;
        case channels.DUSTIFY_MESH_PT_CHANNEL_ID:
          await handleMeshBackupMsg(m);
          break;
        case channels.DUSTIFY_MESH_SE_CHANNEL_ID:
          await handleMeshBackupMsg(m);
          break;
        default:
          break;
      }
    }

    // if (m.guild_id === channels.WARRIOR_GUILD_ID) {
    //   switch (m.channel_id) {
    //     case channels.WARRIOR_MESH_CHANNEL_ID:
    //       await handleMeshBackupMsg(m);
    //       break;

    //     case channels.WARRIOR_MESH_INFO_ID:
    //       SendTelegramMessage(JSON.stringify(m));
    //       break;

    //     default:
    //       break;
    //   }
    // }

    // if (m.guild_id === channels.CYBERSOLE_GUILD_ID) {
    //   switch (m.channel_id) {
    //     case channels.CYBERSOLE_NIKE_CHANNEL_ID:
    //       await handleCybersoleMsg(m);
    //       break;

    //     case channels.CYBERSOLE_SHOPIFY_CHANNEL_ID:
    //       await handleCybersoleMsg(m);
    //       break;

    //     default:
    //       break;
    //   }
    // }
  } catch (error) {
    console.log(error);
  }
});

async function handleTest(m) {
  console.log("Handling test message...");
  console.log(JSON.stringify(m));
}
