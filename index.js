import qrcode from "qrcode-terminal";
import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
import * as dotenv from "dotenv";
import handleIncomingMessage from "./src/handlers/messageHandler.js";

dotenv.config();

console.log("🚀 Initializing WhatsApp bot...");

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
        headless: true,
        args: ['--no-sandbox']
    }
});

client.on("qr", qr => {
    console.log("📱 Scan the QR code below to log in:");
    qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
    console.log("✅ WhatsApp bot connected and ready!");
});

client.on("message", async message => {
    console.log("💬 Received:", message.body);
    await handleIncomingMessage(message);
});

await client.initialize();