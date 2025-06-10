import axios from "axios";

export const sendToTrinity = async (
  pid,
  store,
  m,
  currency,
  country,
  product_page,
  sku
) => {
  const payload = JSON.stringify({
    main_pid: pid,
    size: "random",
    autocheckout: false,
    quantity: 1,
    store: store,
    currency: currency,
    country: country,
    product_page: product_page,
    sku: sku,
  });

  console.log("Sending to trinity", payload);
  return;

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "http://5.178.107.3:3009/mesh/backend",
    headers: {
      "Content-Type": "application/json",
    },
    data: payload,
  };

  axios
    .request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
      //console.log("not worked", error);
    });
};

export default sendToTrinity;
