import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";

export const schema = z.object({
    intent: z.enum(["add_expense", "get_summary", "unknown"]),
    amount: z.number().optional(),
    category: z.string().optional(),
    description: z.string().optional(),
    period: z.string().optional(),
});

export const parser = StructuredOutputParser.fromZodSchema(schema);
