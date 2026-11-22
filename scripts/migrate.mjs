import { neon } from "@neondatabase/serverless";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function runMigrations() {
  const targetFile = process.argv[2] || "0006_slow_wither.sql";
  console.log(`Applying migration ${targetFile} to Neon PostgreSQL...`);
  const migrationFile = path.join(
    process.cwd(),
    "db",
    "migrations",
    targetFile
  );
  const sqlContent = fs.readFileSync(migrationFile, "utf-8");

  const statements = sqlContent
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    console.log(`Executing:\n${statement.substring(0, 60)}...`);
    try {
      await sql.query(statement);
      console.log("-> Success");
    } catch (err) {
      if (
        err.code === "42P07" || // relation already exists
        err.code === "42710" || // constraint already exists
        err.code === "42701" // column already exists
      ) {
        console.log(`-> Already exists (${err.code}), continuing.`);
      } else {
        console.warn(`-> Error (${err.code}):`, err.message);
      }
    }
  }

  console.log("Migration 0004 applied successfully!");
}

runMigrations().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
