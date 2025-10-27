import { ChatGroq } from "@langchain/groq";
import * as dotenv from "dotenv";
dotenv.config();


export const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama-3.3-70b-versatile",
    temperature: 0,
});
