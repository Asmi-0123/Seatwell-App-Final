import { defineConfig } from "drizzle-kit";
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env');
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema-pg.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
