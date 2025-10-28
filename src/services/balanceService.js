import prisma from "../config/db.js";
import { getOrCreateUser } from "./transactionService.js";

/** Set or update current balance */
export async function setBalance(rawPhone, amount) {
    const userId = await getOrCreateUser(rawPhone);
    const updated = await prisma.user.update({
        where: { id: userId.id },
        data: { balance: parseFloat(amount) },
    });
    return updated.balance;
}

/** Deduct amount from user balance after purchase */
export async function deductBalance(rawPhone, amount) {
    const userId = await getOrCreateUser(rawPhone);
    const user = await prisma.user.findUnique({ where: { id: userId.id } });

    const newBalance = (user.balance || 0) - parseFloat(amount);
    const updated = await prisma.user.update({
        where: { id: userId.id },
        data: { balance: newBalance },
    });
    return updated.balance;
}

/** Get current user balance */
export async function getBalance(rawPhone) {
    const userId = await getOrCreateUser(rawPhone);
    const user = await prisma.user.findUnique({ where: { id: userId.id } });
    return user.balance || 0;
}
