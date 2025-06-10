import axios from "axios";
import * as webhookManager from "./assets/main/webhooksManager.js"
import * as analyseMeshBackup from "./assets/main/analyseMeshBackup.js"
import { client, gateway } from "./assets/selcore/selcore.js"

const number_requests = 6;

export var clientSelfcore = client;
var gatewaySelfcore = gateway;

const authorized_sites2 = [
    {
        "site": "jdsports",
        "country": ["FR"],
        "countries_flag": ["🇫🇷"]
    },
    {
        "site": "size",
        "country": ["FR"],
        "countries_flag": ["🇫🇷"]
    },
    {
        "site": "footpatrol",
        "country": ["FR"],
        "countries_flag": ["🇫🇷"]
    }
]

const sendToTrinity = async (pid, store, key, secret, api_key, cequence_key, m) => {
    console.log("pid",pid, "store",store, "key",key, "secret",secret, "api_key",api_key, "cqkey",cequence_key)
    clientSelfcore.sendWebhook(webhookManager.channels_soldout.meshrlnormal.webhook, m);

    const payload = JSON.stringify({
        "main_pid": pid,
        "size": "random",
        "autocheckout": false,
        "quantity": 1,
        "store": store,
        "key": key,
        "secret": secret,
        "api_key": api_key,
        "cequence_key": cequence_key
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'http://5.178.107.3:3009/mesh/backend',
        headers: { 
            'Content-Type': 'application/json'
        },
        data : payload
    };

    axios.request(config)
    .then((response) => {
        console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
        console.log("not worked", error);
    });

};

const sendPlannedTask = async (store, timestamp, PID) => {
    try {
            const response = await axios.post(
            'https://discord.com/api/webhooks/1128314643304157184/maHHafW07aHGiz4z0OJ4X9Yq7Z1N7xlFnGMQmywGgPs1FQMe02JNgPwR7Bjh-UunFuNI',
            {
            'content': null,
            'embeds': [
                {
                'title': 'Task planned',
                'color': 7325543,
                'fields': [
                    {
                    'name': 'Release date',
                    'value': `<t:`+timestamp+`>`
                    },
                    {
                        'name': 'PID',
                        'value': PID
                    }
                ],
                'author': {
                    'name': store
                },
                'footer': {
                    'text': 'Soldout'
                },
                'timestamp': '2022-09-14T22:00:00.000Z'
                }
            ],
            'attachments': []
            },
            {
            params: {
                'wait': 'true'
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/114.0',
                'Accept': 'application/json',
                'Accept-Language': 'en',
                'Accept-Encoding': 'gzip, deflate, br',
                'Referer': 'https://discohook.org/',
                'Content-Type': 'application/json',
                'Origin': 'https://discohook.org',
                'Connection': 'keep-alive',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'cross-site',
                'TE': 'trailers'
            }
            }
        );
    } catch (error) {
        console.error('Webhook call failed:', error);
        // You can choose to log the error, show a user-friendly message, or perform other actions here
    }
};

const extractPid = (str, store) => {
    const regex = new RegExp(`(\\d+_${store})`);
    const match = str.match(regex);

    if (match) {
        const sku = match[0];
        console.log("extractPid pid found", sku); // Affiche : 19577143_jdsportsfr
        return true, sku
    } else {
        console.log("Aucun SKU se terminant par '_jdsportsfr' n'a été trouvé.");
        return
    }
    
}

function scheduleTask(timestamp, pid, store, key, secret, api_key, m) {
    console.log("test planned, pid:", pid);

    const currentTime = Date.now();
    const targetTime = new Date(timestamp * 1000); // Convert the timestamp to milliseconds

    const timeDifference = targetTime.getTime() - currentTime;
    if (timeDifference > 0) {
    sendPlannedTask(store, timestamp, pid);
    setTimeout(async () => {
        console.log("Cron launched!");

        const promises = [];
        for (let step = 0; step < number_requests; step++) {
        console.log("sendToTrinity request number:", step, "of /", number_requests);
        //CEQUENCE KEY CORRECT
        promises.push(sendToTrinity(pid, store, m));
        }

        try {
        await Promise.all(promises);
        console.log("All requests sent successfully!");
        } catch (error) {
        console.error("Error sending requests:", error);
        }
    }, timeDifference);
    } else {
        console.log("The date has already passed");
    }
}

gatewaySelfcore.on('message', async (m) => {
    // if (m.content && (m.content).includes("proxy") || (m.content).includes("proxies")){
    //     sendWebhookToBois(m);
    // }
    
    if (m.guild_id === '672167022569717811') {
        var store;
        switch (m.channel_id) {
            //channel: mesh
            case '1085669074610163733':
                if (m.embeds){
                 
                await analyseMeshBackup.analyzeMeshBackup(m)
            }
            break;
                
            // //Channel: Mesh backup
            case '840354822758465566':
                if (m.embeds){
                    if (m.embeds){
                        await analyseMeshBackup.analyzeMeshBackup(m)
                        await webhookManager.sendToSoldoutWebhook(m)
                    }
                }
                break;
               // //mesh releases
            // //1009571880111448195
            // case "1009571880111448195":
            //     if (m.embeds[0]){
            //         if ((m.embeds[0].fields[0].name).includes("Release date") && (m.embeds[0].fields[1].name).includes("Regions")){
            //             webhookManager.sendToSoldoutWebhookMeshRelease(m);
            //             //Verify the value of region
            //             if ((m.embeds[0].fields[1].value).includes("_jdsportsfr")){
            //                 //JdsportsFR
            //                 var extractedPid = extractPid(m.embeds[0].fields[1].value, "jdsportsfr");

            //                 if (extractedPid){
            //                     //console.log("release date:", m.embeds[0].fields[0].value)
            //                     //Get timestamp and schedule task
            //                     var timestampFound = extractTimeStamp.extractTimeStamp(m.embeds[0].fields[0].value)
            //                     scheduleTask(timestampFound, extractedPid, "jdsportsfr", 'f2188a5b06', '8bb6bd51c83f2ec9821e1bda5c77b25b', '7989920DCCD249F8AEE368BB42324BD6', m)
            //                 }
            //             }

            //             if ((m.embeds[0].fields[1].value).includes("_footpatrolfr")){

            //                 //FootpatrolFR
            //                 var extractedPid = extractPid(m.embeds[0].fields[1].value, "footpatrolfr");

            //                 if (extractedPid){

            //                     //Get timestamp and schedule task
            //                     var timestampFound = extractTimeStamp.extractTimeStamp(m.embeds[0].fields[0].value)
            //                     scheduleTask(timestampFound, extractedPid, store, '9100705ee0', 'b6b631e9c6866ad0fb654e29bcd22b7c', 'D52752B19E244585B532FE4B3752F2A8', m)
            //                 }
            //             }

            //             if ((m.embeds[0].fields[1].value).includes("_sizefr")){

            //                 //Size fr
            //                 var extractedPid = extractPid(m.embeds[0].fields[1].value, "sizefr");

            //                 if (extractedPid){

            //                     //Get timestamp and schedule task
            //                     var timestampFound = extractTimeStamp.extractTimeStamp(m.embeds[0].fields[0].value)
            //                     scheduleTask(timestampFound, extractedPid, store, '2a54a4bd66', 'b64d50a93b0c907c109b29fa9b3ca5a2', '4EE1BC68D4E342D49D39C00ABF5942D2', m)
            //                 }
            //             }
                        
            //         }
            //     }else{
            //         //message from admin or other
            //         client.sendMessage(webhookManager.channels_soldout.meshreleases.channel_id, m.content)
            //     }
            
            //     break;
            
                default:
                //webhookManager.sendToSoldoutWebhookMeshRelease(m);
                break;
        }
    }
});