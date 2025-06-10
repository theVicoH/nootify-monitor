import Selfcore from "./selfcoreLocal.js";
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

const DISCORD_ACCOUNT_TOKEN = process.env.DISCORD_ACCOUNT_TOKEN;
const client = new Selfcore(DISCORD_ACCOUNT_TOKEN);
const gateway = new Selfcore.Gateway(DISCORD_ACCOUNT_TOKEN);

export { client, gateway };
