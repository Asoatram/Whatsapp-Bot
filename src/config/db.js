import * as dotenv from "dotenv";
dotenv.config();

// Dynamically import CommonJS Prisma client
const { PrismaClient } = await import("../generated/prisma/client.js");

let prisma;

if (!global.__prisma) {
    global.__prisma = new PrismaClient();
}
prisma = global.__prisma;

export async function connectDB() {
    try {
        await prisma.$connect();
        console.log("✅ Connected to PostgreSQL via Prisma (CJS client in ESM app)");
    } catch (error) {
        console.error("❌ Database connection failed:", error);
        process.exit(1);
    }
}

await connectDB();

export default prisma;
