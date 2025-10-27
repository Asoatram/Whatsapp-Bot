// jest.config.mjs
export default {
    // Environment in which tests run
    testEnvironment: "node",

    // Don't transform anything (you use native ESM)
    transform: {},

    // Include your setup file (for .env loading)
    setupFiles: ["<rootDir>/tests/jest.env.mjs"],

    // ✅ This is the “where”: tell Jest where to look for tests
    testMatch: [
        "<rootDir>/tests/**/*.test.js", // all .test.js files in /tests
    ],

    // Optional: File extensions Jest recognizes
    moduleFileExtensions: ["js", "json"],
};