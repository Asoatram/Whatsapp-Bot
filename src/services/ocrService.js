import prisma from "../config/db.js";
import { getOrCreateUser, addTransaction } from "./transactionService.js";
import { processReceiptOCR } from "../utils/ocrProcessor.js";

export async function createOcrLog(phoneNumber, imagePath) {
  try {
    const user = await getOrCreateUser(phoneNumber);

    const ocrLog = await prisma.ocrLog.create({
      data: {
        userId: user.id,
        imagePath,
        status: "pending",
      },
    });

    return ocrLog;
  } catch (error) {
    console.error("❌ Error creating OCR log:", error);
    throw error;
  }
}

export async function processOcrAndCreateTransactions(ocrLogId) {
  try {
    const ocrLog = await prisma.ocrLog.findUnique({
      where: { id: ocrLogId },
      include: { user: true },
    });

    if (!ocrLog) {
      throw new Error("OCR log not found");
    }

    const result = await processReceiptOCR(ocrLog.imagePath);

    await prisma.ocrLog.update({
      where: { id: ocrLogId },
      data: {
        extractedText: result.extractedText,
        parsedData: result.parsedData,
        status: result.status,
        errorMessage: result.errorMessage,
      },
    });

    if (result.status === "success" && result.parsedData) {
      const { total_amount, items } = result.parsedData;

      if (total_amount && !items?.length) {
        const transaction = await addTransaction(
          ocrLog.user.phoneNumber,
          total_amount,
          "misc",
          "Receipt scan"
        );

        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { ocrLogId: ocrLog.id },
        });

        return {
          success: true,
          transactionCount: 1,
          totalAmount: total_amount,
          ocrLog,
        };
      }

      if (items?.length > 0) {
        const transactions = await Promise.all(
          items.map((item) =>
            addTransaction(
              ocrLog.user.phoneNumber,
              item.amount,
              item.category || "misc",
              item.name
            )
          )
        );

        await Promise.all(
          transactions.map((tx) =>
            prisma.transaction.update({
              where: { id: tx.id },
              data: { ocrLogId: ocrLog.id },
            })
          )
        );

        const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

        return {
          success: true,
          transactionCount: items.length,
          totalAmount,
          ocrLog,
        };
      }
    }

    return {
      success: false,
      message: result.errorMessage || "Could not extract transaction data",
      ocrLog,
    };
  } catch (error) {
    console.error("❌ Error processing OCR:", error);
    throw error;
  }
}
