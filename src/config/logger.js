import winston from "winston";
import "winston-daily-rotate-file";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDir = path.join(__dirname, "../../logs");

// Define file rotation (new log per day, keep 14 days)
const transport = new winston.transports.Console({
    filename: path.join(logDir, "app-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "10m",
    maxFiles: "14d",
});

// Console formatter for dev readability
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: "HH:mm:ss" }),
    winston.format.printf(({ level, message, timestamp }) => {
        return `[${timestamp}] ${level}: ${message}`;
    })
);

// File format (JSON for later parsing)
const fileFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
);

const logger = winston.createLogger({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    format: fileFormat,
    transports: [
        new winston.transports.Console({ format: consoleFormat }),
        transport,
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: path.join(logDir, "exceptions.log") }),
    ],
    rejectionHandlers: [
        new winston.transports.File({ filename: path.join(logDir, "rejections.log") }),
    ],
});

export default logger;
