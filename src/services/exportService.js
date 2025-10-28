import prisma from "../config/db.js";
import { getOrCreateUser } from "./transactionService.js";
import { exportTransactionsToCSV } from "../utils/exportCsv.js";
import logger from "../config/logger.js";

export async function generateTransactionExport(phone) {
    const userId = await getOrCreateUser(phone);
    logger.info(userId);
    const transactions = await prisma.transaction.findMany({
        where: { "userId": userId.id },
        orderBy: { createdAt: "desc" },
    });

    if (!transactions.length) {
        throw new Error("No transactions to export.");
    }

    const filePath = await exportTransactionsToCSV(phone, transactions);
    return filePath;
}
