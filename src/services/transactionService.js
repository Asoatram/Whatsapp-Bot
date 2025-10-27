import prisma from "../config/db.js";

export async function getOrCreateUser(phoneNumber, name = null) {
    try {
        const user = await prisma.user.upsert({
            where: { phoneNumber },
            update: {},
            create: { phoneNumber, name },
        });
        return user;
    } catch (error) {
        console.error("❌ Error in getOrCreateUser:", error);
        throw error;
    }
}

export async function addTransaction(phoneNumber, amount, category, description) {
    try {
        if (!amount || isNaN(amount)) {
            throw new Error("Invalid amount value");
        }

        const user = await getOrCreateUser(phoneNumber);

        const transaction = await prisma.transaction.create({
            data: {
                userId: user.id,
                amount: parseFloat(amount),
                category: category || "misc",
                description: description || "",
            },
        });

        return transaction;
    } catch (error) {
        console.error("❌ Error in addTransaction:", error);
        throw error;
    }
}

// Get all transactions for a user
export async function getTransactions(phoneNumber) {
    try {
        const user = await prisma.user.findUnique({
            where: { phoneNumber },
            include: { transactions: true },
        });
        return user ? user.transactions : [];
    } catch (error) {
        console.error("❌ Error in getTransactions:", error);
        throw error;
    }
}

export async function getTotalSpending(phoneNumber, period = null) {
    try {
        const user = await prisma.user.findUnique({
            where: { phoneNumber },
            include: { transactions: true },
        });
        if (!user) return 0;

        let transactions = user.transactions;

        // Optional date filtering
        if (period) {
            const now = new Date();
            let startDate;

            switch (period.toLowerCase()) {
                case "today":
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    break;
                case "week":
                case "this week":
                    startDate = new Date();
                    startDate.setDate(now.getDate() - 7);
                    break;
                case "month":
                case "this month":
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                default:
                    startDate = null;
            }

            if (startDate) {
                transactions = transactions.filter(t => new Date(t.createdAt) >= startDate);
            }
        }

        return transactions.reduce((sum, t) => sum + t.amount, 0);
    } catch (error) {
        console.error("❌ Error in getTotalSpending:", error);
        throw error;
    }
}

export async function getDetailedSummary(phoneNumber, period = "all") {
    // Calculate start date based on period
    const now = new Date();
    let startDate = new Date(0);

    switch (period.toLowerCase()) {
        case "week":
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
        case "month":
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case "year":
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
    }

    const user = await getOrCreateUser(phoneNumber);

    // Fetch grouped transactions
    const data = await prisma.transaction.groupBy({
        by: ["category"],
        _sum: { amount: true },
        _count: { id: true },
        where: {
            userId: user.id,
        },
    });

    // Compute overall total
    const total = data.reduce((acc, d) => acc + (d._sum.amount || 0), 0);

    // Format breakdown
    const breakdown = data
        .map(d => ({
            category: d.category || "Uncategorized",
            amount: d._sum.amount || 0,
            count: d._count.id,
            percent: total > 0 ? ((d._sum.amount / total) * 100).toFixed(1) : 0,
        }))
        .sort((a, b) => b.amount - a.amount);

    return { total, breakdown, count: breakdown.reduce((a, b) => a + b.count, 0) };
}