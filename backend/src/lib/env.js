import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Always load from project root (backend directory)
const result = dotenv.config({
    path: path.resolve(__dirname, "../../.env")
});

if (result.error) {
    console.warn("Warning: .env file not found, using process environment variables");
} else {
    console.log("✅ Environment variables loaded from .env");
}

// Export for convenience
export const env = process.env;