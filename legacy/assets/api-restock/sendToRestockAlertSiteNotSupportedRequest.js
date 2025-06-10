import axios from "axios";

// export async function sendToRestockAlertSiteNotSupportedRequest(pid, thumbnail, price, product_name, product_page, currency, site, country, sizes) {

//     const ep = 'https://sold-out.io/phx/restocks';
//     var payload = null;
//     var headers =  headers = {
//         'Authorization': 'Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJwaG9lbml4X2FwaSIsImV4cCI6MTY5NTY1NDk0NSwiaWF0IjoxNjkwNDcwOTQ1LCJpc3MiOiJwaG9lbml4X2FwaSIsImp0aSI6IjQ3NjQwZmQ3LTgwYTMtNDM5Yi1iNjgxLWFiOTM5OGMwZWRmYyIsIm5iZiI6MTY5MDQ3MDk0NCwic3ViIjoiNTUyODlkOWUtMzA2Mi00NzUzLTk0NWMtOTUzN2FiMjRjODU2IiwidHlwIjoiYWNjZXNzIn0.RBw8F1F88KRh88pmCxXuE0vIfTdOE6CiJLzoC9mfSDzMvCVpqbl4l7-Kwr2uxHPSCiJmy7xlXADjaHjvjp_hqA',
//         'Content-Type': 'application/json'
//     };

//     if ( sizes && sizes.length ){
//         sizes.map((size) => {
//             console.log("sendToRestockAlertSiteNotSupportedRequest", price)
//             payload = JSON.stringify({
//                 "restock": {
//                     "pid": pid,
//                     "uuid_session":"0",
//                     "payment_site":"adyen",
//                     "commission":1000,
//                     "size":size,
//                     "thumbnail": thumbnail,
//                     "price": `${price*100}`,
//                     "product_name": product_name,
//                     "product_page": product_page,
//                     "site": site,
//                     "is_carted": false,
//                     "currency": currency,
//                     "country": country
//                 }
//             });
//             console.log("payload", payload)
//             try {
//                 const response = axios.post(ep, payload, { headers });
//                 if (response.status === 201) {
//                     console.log("🚀 ~ file: sendToRestockAlertSiteNotSupportedRequest.js:34 ~ sizes.map ~ response:")
//                     return null;
//                 }
//             } catch (error) {
//                 return error;
//             }

//         })
//     }else{
//         console.log("sendToRestockAlertSiteNotSupportedRequest else", price)
//         payload = JSON.stringify({
//             "restock": {
//                 "pid": pid,
//                 "uuid_session":"0",
//                 "payment_site":"adyen",
//                 "commission":1000,
//                 "size":"null",
//                 "thumbnail": thumbnail,
//                 "price": `${price*100}`,
//                 "product_name": product_name,
//                 "product_page": product_page,
//                 "site": site,
//                 "is_carted": false,
//                 "currency": currency,
//                 "country": country
//             }
//         });
//         console.log("payload", payload)
//         try {
//             const response = await axios.post(ep, payload, { headers });
//             if (response.status === 201) {
//                 //console.log("🚀 ~ file: sendToRestockAlertSiteNotSupportedRequest.js:33 ~ sendToRestockAlertSiteNotSupportedRequest ~ product_name, site:", product_name, site)
//                 return null;
//             }
//         } catch (error) {
//             return error;
//         }
//     }

//     return new Error('UNDEFINED');
// }

export async function sendToRestockAlertSiteNotSupportedRequest(
  pid,
  sku,
  thumbnail,
  price,
  product_name,
  product_page,
  currency,
  site,
  country,
  sizes
) {
  const ep = "https://sold-out.io/phx/restocks";
  var payload = null;
  var headers = {
    Authorization:
      "Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJwaG9lbml4X2FwaSIsImV4cCI6MTY5NzM4MTIwMSwiaWF0IjoxNjkyMTk3MjAxLCJpc3MiOiJwaG9lbml4X2FwaSIsImp0aSI6ImM1NzkyNjFmLTIxMDAtNGIyOS1iY2Q3LTAxZjJmYjBkY2RhZCIsIm5iZiI6MTY5MjE5NzIwMCwic3ViIjoiNTUyODlkOWUtMzA2Mi00NzUzLTk0NWMtOTUzN2FiMjRjODU2IiwidHlwIjoiYWNjZXNzIn0.Th8g121pSr0kmgR78i589-H0rPxPSzHKiwe_4bL9mQq6drtHQo6nB_n1cN9MRwgf7tXHF57-0En_4HMyxputAg",
    "Content-Type": "application/json",
  };

  try {
    if (sizes && sizes.length) {
      console.log("Sending to restock alert", {
        restock: {
          pid: pid,
          sku: sku,
          uuid_session: "0",
          payment_site: "adyen",
          commission: 1000,
          size: sizes[0],
          thumbnail: thumbnail,
          price: `${price * 100}`,
          product_name: product_name,
          product_page: product_page,
          site: site,
          is_carted: false,
          currency: currency,
          country: country,
        },
      });
      return
      await Promise.all(
        sizes.map(async (size) => {
          payload = JSON.stringify({
            restock: {
              pid: pid,
              sku: sku,
              uuid_session: "0",
              payment_site: "adyen",
              commission: 1000,
              size: size,
              thumbnail: thumbnail,
              price: `${price * 100}`,
              product_name: product_name,
              product_page: product_page,
              site: site,
              is_carted: false,
              currency: currency,
              country: country,
            },
          });
          console.log("payload request 1", payload);
          const response = await axios.post(ep, payload, { headers });

          if (response.status !== 201) {
            throw new Error(
              "HTTP request failed with status " + response.status
            );
          }
        })
      );
    } else {
      payload = JSON.stringify({
        restock: {
          pid: pid,
          sku: sku,
          uuid_session: "0",
          payment_site: "adyen",
          commission: 1000,
          size: "null",
          thumbnail: thumbnail,
          price: `${price * 100}`,
          product_name: product_name,
          product_page: product_page,
          site: site,
          is_carted: false,
          currency: currency,
          country: country,
        },
      });
      console.log("Sending to restock alert", payload);
      return
      console.log("payload request 2", payload);
      const response = await axios.post(ep, payload, { headers });

      if (response.status !== 201) {
        throw new Error("HTTP request failed with status " + response.status);
      }
    }

    return null; // Successful request, return null to indicate success
  } catch (error) {
    //console.error('Error:', error);
    return error; // Return the error object
  }
}
