import TelegramBot from "node-telegram-bot-api";

export function SendTelegramMessage(text) {
    const bot = new TelegramBot(process.env.TELEGRAM_API, { polling: true });
    bot.sendMessage(-4046230422, text);
}
