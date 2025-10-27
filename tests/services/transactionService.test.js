/* eslint-env jest */
import prisma from "../../src/config/db.js";
import { addTransaction, getTotalSpending, getDetailedSummary } from "../../src/services/transactionService.js";
import { getOrCreateUser } from "../../src/services/transactionService.js";

const PHONE = "6281254254664@c.us";

describe("Transaction Service", () => {
    beforeAll(async () => {
        await prisma.$connect();
        await prisma.transaction.deleteMany({});
        await prisma.user.deleteMany({});
    });

    afterAll(async () => {
        await prisma.transaction.deleteMany({});
        await prisma.user.deleteMany({});
        await prisma.$disconnect();
    });

    test("creates user by phone and inserts a transaction", async () => {
        let user = await prisma.user.findFirst({ where: { phoneNumber: PHONE } });
        expect(user).toBeNull();

        const tx = await addTransaction(PHONE, 20000, "food", "lunch");
        expect(tx.amount).toBe(20000);

        user = await prisma.user.findFirst({ where: { phoneNumber: PHONE } });
        expect(user).not.toBeNull();
    });

    test("computes total spending (period optional)", async () => {
        await addTransaction(PHONE, 5000, "transport", "bus");
        const totalAny = await getTotalSpending(PHONE);
        expect(totalAny).toBe(25000);

        const totalWeek = await getTotalSpending(PHONE, "week");
        expect(totalWeek).toBeGreaterThan(0);
    });

    test("returns detailed summary grouped by category", async () => {
        await addTransaction(PHONE, 10000, "shopping", "tshirt");

        const { total, breakdown, count } = await getDetailedSummary(PHONE, "month");
        expect(total).toBeGreaterThan(0);
        expect(count).toBeGreaterThanOrEqual(3);

        const categories = breakdown.map(b => b.category.toLowerCase());
        expect(categories).toEqual(expect.arrayContaining(["food", "transport", "shopping"]));
    });

    test("getOrCreateUserByPhone is stable", async () => {
        const id1 = await getOrCreateUser(PHONE);
        const id2 = await getOrCreateUser(PHONE);
        expect(id1).toStrictEqual(id2);
    });
});
