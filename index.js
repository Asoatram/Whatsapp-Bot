import qrcode from "qrcode-terminal";
import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
import * as dotenv from "dotenv";
import {handleFinancialMessage} from "./src/ai/handler.js";
import {handleNaturalMessage} from "./src/ai/langchain.js";
import handleIncomingMessage from "./src/handlers/messageHandler.js";
import { scheduleReminders } from "./src/services/reminderService.js";


dotenv.config();

// Initialize WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth(), // saves your session so you don’t scan QR every time
    puppeteer: { headless: true },
});

client.on("qr", qr => {
    console.log("📱 Scan the QR code below to log in:");
    qrcode.generate(qr, { small: true });
});

// Once ready
client.on("ready", () => {
    console.log("✅ WhatsApp bot connected and ready!");
    scheduleReminders(client);
});

client.on("message", async message => {
    console.log("💬 Received:", message.body);
    await handleIncomingMessage(message);
});


await client.initialize();