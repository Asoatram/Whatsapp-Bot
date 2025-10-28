import cron from "node-cron";
import prisma from "../config/db.js";
import {getDetailedSummary} from "./transactionService.js";
import { getBalance } from "./balanceService.js";
import { ChatGroq } from "@langchain/groq";

import * as dotenv from "dotenv";
dotenv.config();

const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
});

/**
 * Generate a personalized reminder based on spending and balance
 */
async function generateSmartReminder(user) {
    const [analytics, balance] = await Promise.all([
        getDetailedSummary(user.phoneNumber),
        getBalance(user.phoneNumber),
    ]);

    const context = {
        balance,
        total_spent: analytics.total,
        breakdown: analytics.breakdown,
    };

    const prompt = `
You are a friendly finance assistant.
Write a short 2-3 sentence reminder message based on the data below.

Data:
${JSON.stringify(context, null, 2)}

Rules:
- Encourage saving if balance is low.
- Praise the user if spending is balanced.
- If a single category dominates (>40%), suggest reducing it.
- Keep it motivational and simple.
`;

    const response = await model.invoke([{ role: "user", content: prompt }]);
    return response.content.trim();
}

/**
 * Send reminders to all users
 */
export async function runDailyReminders(client) {
    const users = await prisma.user.findMany();

    for (const user of users) {
        try {
            const message = await generateSmartReminder(user);
            await client.sendMessage(user.phone, `🤖 Smart Reminder\n\n${message}`);
            console.log(`✅ Reminder sent to ${user.phone}`);
        } catch (err) {
            console.error(`❌ Failed to send reminder to ${user.phone}:`, err);
        }
    }
}

/**
 * Schedule reminder job (runs at 8 AM every day)
 */
export function scheduleReminders(client) {
    cron.schedule("0 8 * * *", async () => {
        console.log("⏰ Running daily reminder job...");
        await runDailyReminders(client);
    });

    console.log("✅ Smart reminder job scheduled (daily at 8 AM)");
}
