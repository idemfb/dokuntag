import { config } from "dotenv";

config({ path: ".env.test", override: false });
config({ path: ".env.development", override: false });
config({ path: ".env", override: false });

if (!process.env.BASE_URL || !process.env.BASE_URL.startsWith("http")) {
  process.env.BASE_URL = "http://localhost:3000";
}

process.env.NODE_ENV = "test";