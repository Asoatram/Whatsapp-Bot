export function normalizePhone(raw) {
    if (!raw) return "";
    // whatsapp-web.js formats: "62812...@c.us" or in groups "62812...-xxxx@g.us"
    return String(raw).replace(/@c\.us|@g\.us.*/g, "");
}
