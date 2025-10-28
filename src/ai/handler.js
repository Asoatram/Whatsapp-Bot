import { model } from "./llm.js";
import { parser } from "./parser.js";
import { getUserMemory, saveUserMemory, trimContext } from "./memory.js";
import {addTransaction, getDetailedSummary, getTotalSpending} from "../services/transactionService.js";
import {generateTransactionExport} from "../services/exportService.js";

export async function handleFinancialMessage(message, phoneNumber) {
    const history = await getUserMemory(phoneNumber);

    const contextText = history
        .map(h => `User: ${h.user}\nBot: ${h.bot}`)
        .join("\n");

const prompt = `
You are a helpful financial assistant. Use the past messages to understand context.

Available categories: food, transport, shopping, bills, health, housing, misc, other

Past conversation:
${contextText || "None"}

User message: "${message}"

Return structured JSON that matches:
${parser.getFormatInstructions()}
`;

    try {
        const response = await model.invoke(prompt);
        const parsed = await parser.parse(response.content);

        let reply;

        switch (parsed.intent) {
            case "add_expense": {
                let amount = parsed.amount;
                if (typeof amount === "string") {
                    const normalized = amount.replace(/[^\d.,]/g, "").replace(",", ".");
                    amount = parseFloat(normalized);
                }
                if (!amount || isNaN(amount)) {
                    reply = "Please include the amount you spent.";
                    break;
                }
                await addTransaction(phoneNumber, amount, parsed.category, parsed.description);
                reply = `✅ Added ${amount.toLocaleString()} for ${parsed.category || parsed.description}.`;
                break;
            }
            case "export_csv": {
                try {
                    const filePath = await generateTransactionExport(phoneNumber);
                    return { filePath, message: "📤 Export complete! Sending your CSV file..." };
                } catch (err) {
                    return "⚠️ No transactions found to export.";
                }
            }

            case "get_summary": {
                const period = parsed.period || "month";
                const { total, breakdown, count } = await getDetailedSummary(phoneNumber, period);

                if (total === 0) {
                    reply = `No recorded spending ${period === "all" ? "" : "for this " + period}.`;
                    break;
                }

                const icons = {
                    food: "🍔",
                    transport: "🚗",
                    shopping: "🛍",
                    bills: "💡",
                    health: "💊",
                    other: "💰",
                };

                const summaryLines = breakdown
                    .map(b => `${icons[b.category?.toLowerCase()] || "💰"} ${b.category}: ${b.amount.toLocaleString()} (${b.percent}%)`)
                    .join("\n");

                reply = `
                💰 Total spending: ${total.toLocaleString()}
📊 Breakdown:
${summaryLines}

🧾 ${count} transactions recorded
                `.trim();

                break;
            }

            default:
                reply = "Sorry, I didn’t understand that. Try: 'I spent 20k on lunch'.";
        }

        // save context
        const newHistory = trimContext([...history, { user: message, bot: reply }]);
        await saveUserMemory(phoneNumber, newHistory);

        return reply;
    } catch (err) {
        console.error("❌ AI error:", err);
        return "There was a problem understanding your message.";
    }
}
