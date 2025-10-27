import { ChatGroq } from "@langchain/groq";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import { addTransaction, getTotalSpending } from "../services/transactionService.js";

// Simple in-memory message store
const userContext = new Map();

// Initialize model
const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama-3.3-70b-versatile",
    temperature: 0,
});

const parser = StructuredOutputParser.fromZodSchema(
    z.object({
        intent: z.enum(["add_expense", "get_summary", "unknown"]),
        amount: z.number().optional(),
        category: z.string().optional(),
        description: z.string().optional(),
        period: z.string().optional(),
    })
);

export async function handleNaturalMessage(message, phoneNumber) {
    // Combine previous context with new message
    const prev = userContext.get(phoneNumber) || "";
    const combinedPrompt = `
You are a helpful financial assistant. Use the past conversation to infer meaning.

Past context:
${prev}

New user message:
"${message}"

Extract structured info and respond using:
${parser.getFormatInstructions()}
`;

    try {
        const response = await model.invoke(combinedPrompt);
        const parsed = await parser.parse(response.content);

        let reply;

        if (parsed.intent === "add_expense") {
            if (!parsed.amount) return "Please include the amount you spent.";
            await addTransaction(phoneNumber, parsed.amount, parsed.category, parsed.description);
            reply = `✅ Added ${parsed.amount} for ${parsed.category || parsed.description}.`;
        } else if (parsed.intent === "get_summary") {
            const total = await getTotalSpending(phoneNumber, parsed.period);
            reply = `💰 Total spending${parsed.period ? " for " + parsed.period : ""}: ${total}`;
        } else {
            reply = "Sorry, I didn’t understand that. Try: 'I spent 20k on lunch'.";
        }

        // Save context
        userContext.set(phoneNumber, `${prev}\nUser: ${message}\nBot: ${reply}`);
        return reply;
    } catch (err) {
        console.error("❌ Groq processing error:", err);
        return "There was a problem understanding your message.";
    }
}
