import prisma, {connectDB} from "../../src/config/db.js";
import {addTransaction} from "../../src/services/transactionService.js";
const { computeReplyForMessageBody } = await import("../../src/handlers/messageHandler.js");

describe("messageHandler.computeReplyForMessageBody", () => {
    beforeAll(async () => {
        await connectDB(); // 👈 connect once before all tests
        await prisma.ocrLog.deleteMany({})
        await prisma.transaction.deleteMany({});
        await prisma.user.deleteMany({});
    });

    afterAll(async () => {
        await prisma.transaction.deleteMany({});
        await prisma.ocrLog.deleteMany({});
        await prisma.user.deleteMany({});
        await prisma.$disconnect();
    });

    test("normalizes phone and routes text to AI", async () => {
        const reply = await computeReplyForMessageBody("I spent 20000 on lunch", "6281234567890@c.us");
        expect(reply).toBe("✅ Added 20,000 for food.");
    });

    test("returns total for a summary question", async () => {
        const phone = "6281234567890@g.us";
        // pre-insert transaction into DB
        await addTransaction(phone, 20000, "food", "lunch test");

        const reply = await computeReplyForMessageBody("how much did I spend", phone);
        expect(reply).toBe(
            `💰 Total spending: 20,000
📊 Breakdown:
🍔 food: 20,000 (100.0%)

🧾 1 transactions recorded`
        );
    });
    test("handles empty text", async () => {
        const reply = await computeReplyForMessageBody("", "6281234567890@c.us");
        expect(reply).toBe("Sorry, I didn’t understand that. Try: 'I spent 20k on lunch'.");
    });

    test("ignores obvious service messages", async () => {
        const reply = await computeReplyForMessageBody("joined the group", "6281234567890@c.us");
        expect(reply).toBe(""); // no reply
    });
});
