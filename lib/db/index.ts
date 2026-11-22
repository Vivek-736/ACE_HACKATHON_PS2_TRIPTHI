import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl && typeof window === "undefined" && process.env.NODE_ENV !== "production") {
  console.warn("DATABASE_URL is not set. Add it to .env or environment variables.");
}

export const db = drizzle(
  neon(databaseUrl || "postgresql://unconfigured:unconfigured@localhost:5432/unconfigured"),
  { schema }
);

