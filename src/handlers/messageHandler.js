import { handleFinancialMessage } from "../ai/handler.js";
import pkg from 'whatsapp-web.js';
import {handleMediaMessage, isOcrRequest} from "./mediaHandler.js";
import logger from "../config/logger.js";
const {MessageMedia} = pkg;
// Pure, testable
export async function computeReplyForMessageBody(text, from) {

    const reply = await handleFinancialMessage(text.trim(), from);

    if (/^(joined|left|added|removed)/i.test(text)) return "";


    return reply || "Sorry, I couldn’t process that.";
}

// WhatsApp wiring
export default async function handleIncomingMessage(message) {
    try {

        // PRIORITY 1: Handle media messages (images for OCR)
        if (message.hasMedia || isOcrRequest(message)) {
            const ocrResult = await handleMediaMessage(message);
            if (ocrResult !== null) {
                return; // OCR handler already sent reply
            }
        }

        const text = message.body?.trim?.() ?? "";
        const reply = await computeReplyForMessageBody(text, message.from);

        if (typeof reply === "string") {
            await message.reply(reply);
        } else if (reply.filePath) {
            const media = MessageMedia.fromFilePath(reply.filePath);
            await message.reply(reply.message);
            await message.reply(media);
        }    } catch (error) {
        logger.error("❌ Error handling message:", error);
        try {
            await message.reply("Something went wrong while processing your request.");
        } catch {}
    }
}
