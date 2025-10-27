import { defineConfig, env } from "@prisma/config";
import * as dotenv from "dotenv";
dotenv.config();

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    engine: "library", // ✅ ensures ESM-compatible output
    client: {
        output: "./src/generated/prisma", // your custom folder
        generator: {
            provider: "prisma-client-js",
            engineType: "library",
        },
    },
    datasource: {
        url: env("DATABASE_URL"),
    },
});