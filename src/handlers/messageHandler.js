import { handleFinancialMessage } from "../ai/handler.js";
import pkg from 'whatsapp-web.js';
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
        // ignore non-text here (media handled elsewhere if you like)
        const text = message.body?.trim?.() ?? "";
        const reply = await computeReplyForMessageBody(text, message.from);

        if (typeof reply === "string") {
            await message.reply(reply);
        } else if (reply.filePath) {
            const media = MessageMedia.fromFilePath(reply.filePath);
            await message.reply(reply.message);
            await message.reply(media);
        }    } catch (error) {
        console.error("❌ Error handling message:", error);
        try {
            await message.reply("Something went wrong while processing your request.");
        } catch {}
    }
}
