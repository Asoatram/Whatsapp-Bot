import qrcode from "qrcode-terminal";
import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
import * as dotenv from "dotenv";
dotenv.config();

// Initialize WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth(), // saves your session so you don’t scan QR every time
    puppeteer: { headless: true },
});

// QR code event (to login)
client.on("qr", qr => {
    console.log("📱 Scan the QR code below to log in:");
    qrcode.generate(qr, { small: true });
});

// Once ready
client.on("ready", () => {
    console.log("✅ WhatsApp bot connected and ready!");
});

// Placeholder for messages (we’ll hook logic here later)
client.on("message", async message => {
    console.log("💬 Received:", message.body);
    if (message.body.includes("ping")) {
        await message.reply("pong ✅");
    } else {
    }
});

await client.initialize();