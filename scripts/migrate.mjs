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
  console.log("Applying migrations to Neon PostgreSQL...");
  const migrationFile = path.join(
    process.cwd(),
    "db",
    "migrations",
    "0003_aromatic_firelord.sql"
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
        err.code === "42710" // constraint already exists
      ) {
        console.log(`-> Already exists (${err.code}), continuing.`);
      } else {
        console.warn(`-> Error (${err.code}):`, err.message);
      }
    }
  }

  // Check all tables exist in information_schema
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `;
  console.log(
    "Public tables now in Neon DB:",
    tables.map((t) => t.table_name)
  );
}

runMigrations().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
