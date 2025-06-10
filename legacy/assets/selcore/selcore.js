import Selfcore from "selfcore";
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file
const TOKEN = process.env.TOKEN;
const client = new Selfcore(TOKEN);
const gateway = new Selfcore.Gateway(TOKEN);

export { client, gateway };
