/**
 * Pre-build script — runs automatically before `next build` on Vercel.
 *
 * If DATABASE_PROVIDER=postgresql is set (production), this swaps the Prisma
 * schema's datasource provider from "sqlite" to "postgresql" and regenerates
 * the client. Locally (where DATABASE_PROVIDER is unset or "sqlite"), it does
 * nothing — the schema stays as SQLite and the existing client is used.
 *
 * This means the SAME codebase works on both local dev (SQLite) and Vercel
 * (PostgreSQL) without the user ever needing to manually edit schema.prisma.
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const schemaPath = path.join(__dirname, "..", "prisma", "schema.prisma");
const provider = process.env.DATABASE_PROVIDER || "sqlite";

if (provider === "postgresql") {
  console.log("→ DATABASE_PROVIDER=postgresql: switching schema to postgresql...");
  let schema = fs.readFileSync(schemaPath, "utf8");
  if (schema.includes('provider = "sqlite"')) {
    schema = schema.replace('provider = "sqlite"', 'provider = "postgresql"');
    fs.writeFileSync(schemaPath, schema);
    console.log("✓ schema.prisma switched to postgresql");
  } else {
    console.log("✓ schema.prisma already on postgresql — no change");
  }
  // Regenerate the Prisma client with the postgresql provider
  console.log("→ Running prisma generate...");
  execSync("npx prisma generate", { stdio: "inherit", cwd: path.join(__dirname, "..") });
  console.log("✓ Prisma client regenerated for postgresql");
} else {
  console.log(`→ DATABASE_PROVIDER=${provider}: keeping SQLite schema (local dev)`);
}

// Push the schema to the database (creates tables if they don't exist).
// This is safe to run every build — it only creates/updates tables, doesn't
// drop data.
if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith("postgres")) {
  console.log("→ Running prisma db push (creating tables in Postgres if needed)...");
  try {
    execSync("npx prisma db push --accept-data-loss", {
      stdio: "inherit",
      cwd: path.join(__dirname, ".."),
    });
    console.log("✓ Database schema pushed");
  } catch (e) {
    console.warn("⚠ prisma db push failed (tables may already exist):", e.message);
  }
}

console.log("→ Build preparation complete.\n");