import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Convert transaction data to CSV and save to a temporary file.
 * @param {string} phone - user phone number
 * @param {Array} transactions - list of transactions
 * @returns {string} full path to generated CSV file
 */
export async function exportTransactionsToCSV(phone, transactions) {
    const headers = ["Date", "Category", "Description", "Amount"];
    const rows = transactions.map(t => [
        new Date(t.createdAt).toISOString().split("T")[0],
        t.category || "",
        t.description || "",
        t.amount.toString(),
    ]);

    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");

    // Save to temporary folder (create if needed)
    const exportDir = path.join(__dirname, "../../exports");
    if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir);

    const filePath = path.join(exportDir, `${phone.replace(/[^0-9]/g, "")}_transactions.csv`);
    fs.writeFileSync(filePath, csv);

    return filePath;
}
