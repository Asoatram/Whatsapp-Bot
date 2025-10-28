// Temporary in-memory storage (skip Redis)
const memoryStore = new Map();

export default {
  get: async (key) => {
    return memoryStore.get(key) || null;
  },
  setex: async (key, expiry, value) => {
    memoryStore.set(key, value);
  },
  del: async (key) => {
    memoryStore.delete(key);
  },
  on: () => {}, // Mock event handlers
};

console.log("⚠️ Using in-memory storage (Redis skipped)");