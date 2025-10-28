import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pkg from "whatsapp-web.js";
const { MessageMedia } = pkg;
import {
    createOcrLog,
    processOcrAndCreateTransactions,
} from "../services/ocrService.js";
import logger from "../config/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OCR_MEDIA_PATH = process.env.OCR_MEDIA_PATH || "./exports/ocr_media";

function ensureMediaDirectory() {
    const fullPath = path.resolve(OCR_MEDIA_PATH);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        logger.info("✅ Created OCR media directory:", fullPath);
    }
}

async function saveMedia(media, phoneNumber) {
    ensureMediaDirectory();

    const timestamp = Date.now();
    const extension = media.mimetype.split("/")[1] || "jpg";
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, "");
    const filename = `${cleanPhone}_${timestamp}.${extension}`;
    const filepath = path.resolve(OCR_MEDIA_PATH, filename);

    const buffer = Buffer.from(media.data, "base64");
    fs.writeFileSync(filepath, buffer);

    logger.info("💾 Media saved:", filepath);
    return filepath;
}

export async function handleMediaMessage(message) {
    try {
        if (!message.hasMedia) {
            return null;
        }

        const media = await message.downloadMedia();

        if (!media.mimetype.startsWith("image/")) {
            await message.reply(
                "❌ Please send an image file (JPG, PNG) for receipt scanning."
            );
            return null;
        }

        await message.reply(
            "📸 Receipt image received! Processing with OCR...\nThis may take 10-30 seconds."
        );

        const imagePath = await saveMedia(media, message.from);

        const ocrLog = await createOcrLog(message.from, imagePath);

        const result = await processOcrAndCreateTransactions(ocrLog.id);

        if (result.success) {
            const reply = `
✅ *Receipt processed successfully!*

📋 Extracted ${result.transactionCount} transaction(s)
💰 Total: ${result.totalAmount.toLocaleString()}

Your expenses have been recorded automatically.
Type "summary" to see your spending breakdown.
      `.trim();

            await message.reply(reply);
        } else {
            await message.reply(
                `⚠️ Could not process receipt automatically.\n\n${
                    result.message || "Please try with a clearer image or enter manually."
                }`
            );
        }

        return result;
    } catch (error) {
        logger.error("❌ Error handling media:", error);
        await message.reply(
            "❌ An error occurred while processing your receipt. Please try again or enter the expense manually."
        );
        return null;
    }
}

export function isOcrRequest(message) {
    const text = message.body?.toLowerCase().trim() || "";
    const ocrKeywords = ["scan", "receipt", "struk", "nota", "bill"];

    return (
        message.hasMedia ||
        ocrKeywords.some((keyword) => text.includes(keyword))
    );
}