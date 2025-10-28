import { getOrCreateUser } from "./transactionService.js";
import { getDetailedSummary } from "./transactionService.js";
import { getBalance } from "./balanceService.js";
import { ChatGroq } from "@langchain/groq";
import * as dotenv from "dotenv";

dotenv.config();

const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama-3.3-70b-versatile", // or mixtral if you want faster output
    temperature: 0.5,
});

export async function getAIPersonalizedAdvice(rawPhone) {
    const [analytics, balance] = await Promise.all([
        getDetailedSummary(rawPhone),
        getBalance(rawPhone),
    ]);


    if (analytics.total === 0) {
        return "💡 You haven’t recorded any spending yet. Start by adding your expenses to receive personalized advice.";
    }


    // Generate AI prompt
    const prompt = `
You are a friendly financial advisor that helps users manage money and budgets.
Use the provided data to generate a short, personalized advice message (max 5 bullet points).
Use simple and encouraging language. Suggest specific improvements.

DATA:
${JSON.stringify(analytics.breakdown, null, 2)}

BALANCE: ${balance}
Guidelines:
- If the balance is low, advise how to save.
- If a single category dominates (>40%), recommend reducing that.
- If spending is balanced, congratulate and motivate.
- Always close with a positive tip or encouragement.
`;

    const response = await model.invoke([{ role: "user", content: prompt }]);
    const aiAdvice = response.content.trim();

    return `🤖 Personalized Budget Advice\n\n${aiAdvice}`;
}
