import axios from "axios";
import WebSocket from "ws";
import EventEmitter from "events";

const eventEmitter = new EventEmitter();

/**
 * @class Selfcore
 * @classdesc A class that provides methods to interact with the Discord API.
 * @param {string} token - The Discord account token.
 * Imported from the selfcore package (https://github.com/ExordiumX/selfcore)
 * Improved with the ability to reconnect to the gateway when the connection is lost.
 */
class Selfcore {
  token;
  headers;

  constructor(token) {
    this.token = token;
    this.headers = {
      authorization: this.token,
      accept: "*/*",
      "accept-language": "en-US",
      referer: "https://discord.com/channels/@me",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "user-agent": `Mozilla/5.0 (Macintosh; Intel Mac OS X 11_0_0) AppleWebKit/537.36 (KHTML, like Gecko) discord/0.0.263 Chrome/83.0.4103.122 Electron/9.3.5 Safari/537.36`,
      "x-debug-options": "bugReporterEnabled",
      "x-super-properties":
        "eyJvcyI6Ik1hYyBPUyBYIiwiYnJvd3NlciI6IkRpc2NvcmQgQ2xpZW50IiwicmVsZWFzZV9jaGFubmVsIjoic3RhYmxlIiwiY2xpZW50X3ZlcnNpb24iOiIwLjAuMjYzIiwib3NfdmVyc2lvbiI6IjIwLjUuMCIsIm9zX2FyY2giOiJ4NjQiLCJzeXN0ZW1fbG9jYWxlIjoiZW4tVVMiLCJjbGllbnRfYnVpbGRfbnVtYmVyIjo5MzQ1MiwiY2xpZW50X2V2ZW50X3NvdXJjZSI6bnVsbH0=",
    };
  }

  async sendMessage(channelId, content) {
    try {
      let res = await axios.post(
        `https://discord.com/api/v9/channels/${channelId}/messages`,
        {
          content,
        },
        { headers: this.headers }
      );
      return res.data;
    } catch (err) {
      return { error: err };
    }
  }

  async deleteMessage(channelId, messageId) {
    try {
      let res = await axios.delete(
        `https://discord.com/api/v9/channels/${channelId}/messages/${messageId}`,
        { headers: this.headers }
      );
    } catch (err) {
      return { error: err.response.data.message };
    }
  }

  async joinGuild(invite) {
    try {
      console.log(this.headers);

      let res = await axios.post(
        `https://discord.com/api/v9/invites/${invite}`,
        undefined,
        { headers: this.headers }
      );
    } catch (err) {
      console.log(err);
      return { error: err };
    }
  }

  static async sendWebhook(url, message) {
    try {
      if (typeof message === "object") {
        let res = await axios.post(url, message);
        return res.data;
      } else {
        let res = await axios.post(url, { content: message });
        return res.data;
      }
    } catch (err) {
      return { error: err };
    }
  }

  async getProfile() {
    try {
      let res = await axios.get(
        "https://discord.com/api/v9/users/816004387574251621/profile?with_mutual_guilds=false",
        { headers: this.headers }
      );
      return res.data;
    } catch (err) {
      return { error: err };
    }
  }

  /**
   * @class Gateway
   * @classdesc A class that provides methods to interact with the Discord gateway.
   * @param {string} token - The Discord account token.
   */
  static Gateway = class extends EventEmitter {
    ws;

    token;

    sessionID;
    sequenceNumber;
    resumeGatewayUrl;
    gatewayURL = "wss://gateway.discord.gg/?v=6&encoding=json";

    heartbeat_interval;
    interval;
    payload;

    constructor(token) {
      super();
      this.token = token;
      this.payload = {
        op: 2,
        d: {
          token: this.token,
          properties: {
            $os: "linux",
            $browser: "chrome",
            $device: "chrome",
          },
        },
      };

      this.onOpenListener = () => this.onOpen();
      this.onMessageListener = (message) => this.onMessage(message);
      this.onCloseListener = (code) => this.onClose(code);
      this.onErrorListener = (error) => this.onError(error);

      this.connectToGateway();
    }

    connectToGateway() {
      this.ws = new WebSocket(this.gatewayURL);

      this.ws.on("open", this.onOpenListener);
      this.ws.on("message", this.onMessageListener);
      this.ws.on("close", this.onCloseListener);
      this.ws.on("error", this.onErrorListener);
    }

    onOpen() {
      console.log("Connected to the gateway.");
      if (this.sessionID) {
        const resumePayload = {
          op: 6,
          d: {
            token: this.token,
            session_id: this.sessionID,
            seq: this.sequenceNumber,
          },
        };

        this.ws.send(JSON.stringify(resumePayload));
      } else {
        this.ws.send(JSON.stringify(this.payload));
      }
    }

    onMessage(data) {
      let payload = JSON.parse(data);
      const { t, event, op, d } = payload;

      if (data?.s) {
        sequenceNumber = data.s;
      }

      switch (op) {
        case 10: // Hello
          const { heartbeat_interval } = d;
          this.interval = this.heartbeat(heartbeat_interval);
          this.emit("ready");
          break;
        case 7: // Reconnect
          console.log("Reconnecting...");
          this.sessionID = null;
          this.sequenceNumber = null;
          this.ws.close();
          break;
      }

      switch (t) {
        case "MESSAGE_CREATE":
          // console.log(d);
          this.emit("message", d);
          break;
        case "READY":
          console.log(`Ready! :: Adding sessionID: ${d.session_id} and sequenceNumber: ${d.sequence} to the Gateway instance.`);
          this.sessionID = d.session_id;
          this.sequenceNumber = d.sequence;
          this.resumeGatewayUrl = d.resume_gateway_url;
          break;
      }
    }

    onClose(code) {
      console.log(`Disconnected with code ${code}. Reconnecting...`);
      clearInterval(this.heartbeat_interval);
      if (code === 1006) {
        this.sessionID = null;
        this.sequenceNumber = null;
        this.resumeGatewayUrl = null;
      }

      this.ws.removeListener("open", this.onOpenListener);
      this.ws.removeListener("message", this.onMessageListener);
      this.ws.removeListener("close", this.onCloseListener);
      this.ws.removeListener("error", this.onErrorListener);

      setTimeout(() => {
        this.connectToGateway();
      }, 5000); // Reconnect after 5 seconds.
    }

    onError(err) {
      console.log(err);
    }

    heartbeat = (ms) => {
      this.heartbeat_interval = setInterval(() => {
        this.ws.send(JSON.stringify({ op: 1, d: null }));
      }, ms);
    };
  };
}

export default Selfcore;
