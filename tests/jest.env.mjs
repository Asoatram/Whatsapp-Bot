// tests/jest.env.mjs
import * as dotenv from "dotenv";

// prefer .env.test, fallback to .env
dotenv.config();
console.log("DB URL:", process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) dotenv.config();



if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set for tests (.env.test or .env).");
}