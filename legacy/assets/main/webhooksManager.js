import { client } from "../selcore/selcore.js"

export const channels_soldout = {
    jdsports: {
        webhook_id: "",
        channel_id: "",
        webhook: "https://discord.com/api/webhooks/1121019048457670676/MDQDsbdA-CIfDh2lmw_OwqPLU7si8b-_oNc3MbBYmIt6bAqsc9TPP5MIPtpRntHXzd11"
    },
    meshrl: {
        webhook_id: "",
        channel_id: "",
        webhook: "https://discord.com/api/webhooks/1121019048457670676/MDQDsbdA-CIfDh2lmw_OwqPLU7si8b-_oNc3MbBYmIt6bAqsc9TPP5MIPtpRntHXzd11"
    },
    meshrlnormal: {
        webhook_id: "",
        channel_id: "",
        webhook: "https://discord.com/api/webhooks/1121019048457670676/MDQDsbdA-CIfDh2lmw_OwqPLU7si8b-_oNc3MbBYmIt6bAqsc9TPP5MIPtpRntHXzd11"
    },
    meshreleases: {
        webhook_id: "",
        channel_id: "",
        webhook: "https://discord.com/api/webhooks/1121019048457670676/MDQDsbdA-CIfDh2lmw_OwqPLU7si8b-_oNc3MbBYmIt6bAqsc9TPP5MIPtpRntHXzd11"
    }
};

export const sendToSoldoutWebhook = async (m) => {
    client.sendWebhook(channels_soldout.jdsports.webhook, m);
};
export const sendToSoldoutWebhookMeshRelease = async (m) => {
    client.sendWebhook(channels_soldout.meshreleases.webhook, m);
};
export const sendToSoldoutWebhookMeshNootify = async (m) => {
    client.sendWebhook(channels_soldout.meshrlnormal.webhook, m);
};