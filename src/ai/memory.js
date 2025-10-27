import redis from "../config/redis.js";

const MAX_CONTEXT_LENGTH = 5;
const CONTEXT_EXPIRY_SECONDS = 6 * 60 * 60; // 6h

export async function getUserMemory(phoneNumber) {
    const raw = await redis.get(`context:${phoneNumber}`);
    return raw ? JSON.parse(raw) : [];
}

export async function saveUserMemory(phoneNumber, history) {
    await redis.setex(`context:${phoneNumber}`, CONTEXT_EXPIRY_SECONDS, JSON.stringify(history));
}

export async function clearUserMemory(phoneNumber) {
    await redis.del(`context:${phoneNumber}`);
}

export function trimContext(history) {
    if (history.length > MAX_CONTEXT_LENGTH) history.shift();
    return history;
}
