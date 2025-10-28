import Tesseract from "tesseract.js";
import { model } from "../ai/llm.js";
import { z } from "zod";
import { StructuredOutputParser } from "@langchain/core/output_parsers";

export async function extractTextFromImage(imagePath) {
    try {
        console.log("🔍 Starting OCR on:", imagePath);

        const result = await Tesseract.recognize(imagePath, "eng+ind", {
            logger: (m) => {
                if (m.status === "recognizing text") {
                    console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                }
            },
        });

        const text = result.data.text.trim();
        console.log("✅ OCR completed. Extracted text length:", text.length);

        return text;
    } catch (error) {
        console.error("❌ OCR extraction error:", error);
        throw new Error("Failed to extract text from image");
    }
}

export async function parseReceiptWithLLM(text) {
    const schema = z.object({
        total_amount: z.number().optional(),
        items: z
            .array(
                z.object({
                    name: z.string(),
                    amount: z.number(),
                    category: z.string().optional(),
                })
            )
            .optional(),
        merchant: z.string().optional(),
        date: z.string().optional(),
        confidence: z.enum(["high", "medium", "low"]),
    });

    const parser = StructuredOutputParser.fromZodSchema(schema);

    const prompt = `
You are an expert at analyzing receipt/invoice text extracted from OCR.

Extracted text from receipt:
"""
${text}
"""

Parse this receipt and extract:
1. Total amount (numerical value only)
2. Individual items with their prices
3. Merchant/store name if visible
4. Date if visible
5. Your confidence level in the extraction

Handle Indonesian and English receipts. Be flexible with formatting.
If you can't find total amount, try to sum up item prices.

Return structured JSON:
${parser.getFormatInstructions()}
`;

    try {
        const response = await model.invoke(prompt);
        const parsed = await parser.parse(response.content);

        console.log("🤖 LLM parsed receipt:", JSON.stringify(parsed, null, 2));

        return parsed;
    } catch (error) {
        console.error("❌ LLM parsing error:", error);
        throw new Error("Failed to parse receipt with LLM");
    }
}

export async function processReceiptOCR(imagePath) {
    try {
        const extractedText = await extractTextFromImage(imagePath);

        if (!extractedText || extractedText.length < 10) {
            throw new Error("Not enough text extracted from image");
        }

        const parsedData = await parseReceiptWithLLM(extractedText);

        return {
            extractedText,
            parsedData,
            status: "success",
        };
    } catch (error) {
        console.error("❌ OCR processing error:", error);
        return {
            extractedText: null,
            parsedData: null,
            status: "failed",
            errorMessage: error.message,
        };
    }
}