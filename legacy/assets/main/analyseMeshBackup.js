import * as regexpManager from "../regexp/extractAndConvertPrice.js"
import * as apiRestockManager from "../api-restock/sendToRestockAlertSiteNotSupportedRequest.js"
import * as extractPID from "../regexp/extractPID.js"
import * as webhookManager from "./sendToRestockAlertSiteNotSupportedMeshBackupChannel.js"
import * as meshKeys from "../mesh-keys/meshKeys.js"
import { sendToTrinity } from "../trinity/sendToTrinity.js"

function getUsernameParameters(username, title) {
    const usernameMappings = {
        'jdsports fr [backend]': {
            store: 'jdsportsfr',
            country: 'FR',
            key: meshKeys.usernameMappings.jdsportsfr.key,
            secret: meshKeys.usernameMappings.jdsportsfr.secret,
            api_key: meshKeys.usernameMappings.jdsportsfr.api_key,
            cequence_key: meshKeys.usernameMappings.jdsportsfr.cequence_key,
        },
        'footpatrolfr': {
            store: 'footpatrolfr',
            country: 'FR',
            key: meshKeys.usernameMappings.footpatrolfr.cequence_key,
            secret: meshKeys.usernameMappings.footpatrolfr.cequence_key,
            api_key: meshKeys.usernameMappings.footpatrolfr.cequence_key,
            cequence_key: meshKeys.usernameMappings.footpatrolfr.cequence_key,
        },
        'jdsports fr': {
            store: 'jdsportsfr',
            country: 'FR',
            key: meshKeys.usernameMappings.jdsportsfr.key,
            secret: meshKeys.usernameMappings.jdsportsfr.secret,
            api_key: meshKeys.usernameMappings.jdsportsfr.api_key,
            cequence_key: meshKeys.usernameMappings.jdsportsfr.cequence_key,
        },
        'jdsports be': {
            store: 'jdsportsbe',
            country: 'FR',
            key: meshKeys.usernameMappings.jdsportsbe.key,
            secret: meshKeys.usernameMappings.jdsportsbe.secret,
            api_key: meshKeys.usernameMappings.jdsportsbe.api_key,
            cequence_key: meshKeys.usernameMappings.jdsportsbe.cequence_key,
        },
        'sizeofficial fr': {
            store: 'sizefr',
            country: 'FR',
            key: meshKeys.usernameMappings.sizefr.key,
            secret: meshKeys.usernameMappings.sizefr.secret,
            api_key: meshKeys.usernameMappings.sizefr.api_key,
            cequence_key: meshKeys.usernameMappings.sizefr.cequence_key,
        },
        // 'sizeofficial co uk': {
        //     store: 'sizefr',
        //     key: '2a54a4bd66',
        //     secret: 'b64d50a93b0c907c109b29fa9b3ca5a2',
        //     api_key: '4EE1BC68D4E342D49D39C00ABF5942D2',
        //     cequence_key: '7989920DCCD249F8AEE368BB42324BD6',
        // },
    };

    if ( !username.includes('Nootify')){
        const lowercaseUsername = username.toLowerCase();
        // const lowercaseTitle = title.toLowerCase(); // Convert title to lowercase
     
         // Check if username contains a match
         for (const key of Object.keys(usernameMappings)) {
             if (lowercaseUsername.includes(key)) {
                 return usernameMappings[key];
             }
         }
     
         // // Check if the title contains a match
         // for (const key of Object.keys(usernameMappings)) {
         //     if (lowercaseTitle.includes(key)) {
         //         return usernameMappings[key];
         //     }
         // }
     
         // Check if the URL contains a match
         //FIND / HTTPS / WWW
         if ( username ) { 
             const urlMatch = username.match(/https:\/\/(?:www\.)?([\w.]+)\//);
             console.log("🚀 ~ file: analyseMeshBackup.js:80 ~ getUsernameParameters ~ urlMatch:", urlMatch)
             // if (urlMatch) {
             //     var domain = urlMatch[1].replace(/\s/g, ''); // Remove spaces from the domain
             //     domain = domain.replace('.', ''); // remove point between Domain and TLD
             //     for (const key of Object.keys(usernameMappings)) {
             //         const keyWithoutSpaces = key.replace(/\s/g, ''); // Remove spaces from the key
             //         if (domain.includes(keyWithoutSpaces)) {
             //             return usernameMappings[key];
             //         }
             //     }
             // }
             if (urlMatch) {
                 // Make sure urlMatch is not undefined or null
                 var domain = urlMatch[1].replace(/\s/g, ''); // Remove spaces from the domain
                 domain = domain.replace('.', ''); // remove point between Domain and TLD
                 for (const key of Object.keys(usernameMappings)) {
                   const keyWithoutSpaces = key.replace(/\s/g, ''); // Remove spaces from the key
                   if (domain.includes(keyWithoutSpaces)) {
                     return usernameMappings[key];
                   }
                 }
               }
         }
         // if ( username ) { 
         //     const urlMatch = title.match(/https:\/\/(?:www\.)?([\w.]+)\//);
         //     // if (urlMatch) {
         //     //     var domain = urlMatch[1].replace(/\s/g, ''); // Remove spaces from the domain
         //     //     domain = domain.replace('.', ''); // remove point between Domain and TLD
         //     //     for (const key of Object.keys(usernameMappings)) {
         //     //         const keyWithoutSpaces = key.replace(/\s/g, ''); // Remove spaces from the key
         //     //         if (domain.includes(keyWithoutSpaces)) {
         //     //             return usernameMappings[key];
         //     //         }
         //     //     }
         //     // }
         //     if (urlMatch) {
         //         // Make sure urlMatch is not undefined or null
         //         var domain = urlMatch[1] ? urlMatch[1].replace(/\s/g, '') : ''; // Remove spaces from the domain
         //         domain = domain.replace('.', ''); // remove point between Domain and TLD
         //         for (const key of Object.keys(usernameMappings)) {
         //           const keyWithoutSpaces = key.replace(/\s/g, ''); // Remove spaces from the key
         //           if (domain.includes(keyWithoutSpaces)) {
         //             return usernameMappings[key];
         //           }
         //         }
         //       }
         // }
         
           return null
         //return Object.keys(usernameMappings).find(key => lowercaseUsername.includes(key)) || null
    }else{
        console.log("🚀 ~ file: analyseMeshBackup.js:132 ~ getUsernameParameters ~ else: username includes Nootify")
        const lowercaseUsername = title.toLowerCase();
         for (const key of Object.keys(usernameMappings)) {
             if (lowercaseUsername.includes(key)) {
                 return usernameMappings[key];
             }
         }
     
         if ( title ) { 
             const urlMatch = title.match(/https:\/\/(?:www\.)?([\w.]+)\//);
             console.log("🚀 ~ file: analyseMeshBackup.js:80 ~ getUsernameParameters ~ urlMatch:", urlMatch)
          
             if (urlMatch) {
                 // Make sure urlMatch is not undefined or null
                 var domain = urlMatch[1].replace(/\s/g, ''); // Remove spaces from the domain
                 domain = domain.replace('.', ''); // remove point between Domain and TLD
                 
                 for (const key of Object.keys(usernameMappings)) {
                   const keyWithoutSpaces = key.replace(/\s/g, ''); // Remove spaces from the key
                   if (domain.includes(keyWithoutSpaces)) {
                     return usernameMappings[key];
                   }
                 }
               }
         }
           return null
    }

  
}

export async function getPIDFromFields(embed) {
    const PIDFieldIndex = embed.fields.findIndex(field => {
        return field.name.toLowerCase().includes("pid");
    });

    if (PIDFieldIndex !== -1) {
        const priceField = embed.fields[PIDFieldIndex];
        const result = extractPID.extractPID(priceField.value);
        if (result != null ) {
            return result;
        }
      return null
    }
}

function getAuthorName(embed) {
    //console.log(embed.author.name)
    if (embed.author && embed.author.name) {
        return embed.author.name;
    }
    return null;
}

function getTitleName(embed) {
    //console.log(embed.author.name)
    if (embed.title) {
        return embed.title;
    }
    return null;
}

export async function analyzeMeshBackup(m) {
    const embed = m.embeds[0];

    if (embed) {
  /*
        infos necessaires sites pas supportes par trinity
        pas d'image pas grave
        lien produit, 
        titre produit, 
        site
        prix
    */
    //channel Nootify: mesh-backup


    var PIDValue = getPIDFromFields(embed); 
    var authorName = getAuthorName(embed);
    
    // if ( authorName == null ) {
    var EmbedTitle = getTitleName(embed);
    console.log("🚀 ~ file: analyseMeshBackup.js:231 ~ analyzeMeshBackup ~ EmbedTitle:", EmbedTitle)
    // }
    // if ( authorName != null ) {
    
        // const PID2 = embed.fields[0].value.replace('\\', '').split(' ')[0];
        
        const username = m.author.username;
        console.log("🚀 ~ file: analyseMeshBackup.js:212 ~ analyzeMeshBackup ~ username:", username)
        const title = embed.title;
        console.log("🚀 ~ file: analyseMeshBackup.js:214 ~ analyzeMeshBackup ~ title:", title)
        //Nootify x Yeet Monitors•
        if (username && PIDValue != null ) {
            const usernameParameters = getUsernameParameters(username, title);
            console.log("usernameParameters", usernameParameters)
            // if ( usernameParameters != null ) {
            //     const { store, key, secret, api_key } = usernameParameters;
            //     //Send to trinity to cop
                
                
            //     // for (const mainObj of authorized_sites) {
            //     //     const country_abv = mainObj.country_abv;
            //     //     const country_flag = mainObj.country_flag;
            //     //     const sites = mainObj.sites;
    
            //     //     for (const website_key of sites) {
            //     //         const site = website_key.site;
    
            //     //         if (
            //     //             title.toLowerCase().includes(site) &&
            //     //             embed.fields[0].name.includes("Regions") &&
            //     //             embed.fields[0].value === country_flag
            //     //         ) {
            //     //             if (embed.fields[2] && embed.fields[2].name.includes("PID")) {
            //     //                 const extractedPid = embed.fields[2].value.replaceAll("`", "");
            //     //                 const assembledPID = extractedPid + "_" + site + country_abv;
            //     //                 console.log("assembledPID", assembledPID);
            //     //                 sendToTrinity(assembledPID, site + country_abv, key, secret, api_key, "4EE1BC68D4E342D49D39C00ABF5942D2", m);
            //     //             }
            //     //         }
            //     //     }
            //     // }
            //     sendToTrinity(PIDValue, store, m);
            // }
            // else{
                //Send to restock alert not carted
                webhookManager.sendToRestockAlertSiteNotSupportedMeshBackupChannel(m, PIDValue, authorName, usernameParameters);
                //webhookManager.sendToSoldoutWebhookMeshRelease(m);
            // }
        // }
    }
   

    // let thumbnail = embed.thumbnail ? embed.thumbnail.url : "none";
    // let price = 0;
    // let product_name = embed.title;
    // let product_page = embed.url;
    // let site = m.author.username;
    // let currency = "EUR";
   
    // if (embed.fields) {
    //     const priceFieldIndex = embed.fields.findIndex(field => {
    //         // Check if the field name contains "Price" (case-insensitive)
    //         return field.name.toLowerCase().includes("price");
    //       });

    //     if (priceFieldIndex !== -1) {
    //         const priceField = embed.fields[priceFieldIndex];
    //         const result = regexpManager.extractAndConvertPrice(priceField.value);
    //         if (result.amount !== 0) {
    //             price = result.amount;
    //         }

    //         if (result.currency) {
    //             currency = result.currency;
    //         }
    //     }
    // }

    // // Check if any field value contains "OOS"
    // // const containsOOS = embed.fields.some(field => field.value.includes("OOS"));
    // // // If "OOS" is found in any field value, send the restock alert request
    // // if (containsOOS) {
    // //   return
    // // }

    // apiRestockManager.sendToRestockAlertSiteNotSupportedRequest(thumbnail, price, product_name, product_page, currency, site)
    // .then(result => {
    //     if (result) {
    //         //console.error('Error:', error);
    //     } else {
    //         console.log('Success');
    //     }
    // })
    // .catch(error => {
    //     console.error('Error:', error);
    // });
    }
  
}