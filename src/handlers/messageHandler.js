import { handleFinancialMessage } from "../ai/handler.js";

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

        if (reply) await message.reply(reply);
    } catch (error) {
        console.error("❌ Error handling message:", error);
        try {
            await message.reply("Something went wrong while processing your request.");
        } catch {}
    }
}
